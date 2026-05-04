import json

from fastapi import HTTPException, status
from google import genai
from google.genai import types
from pydantic import ValidationError

from app.config import settings
from app.models.car_profile import UserCarProfile
from app.schemas.recommendation import RecommendationResponse
from app.services import shopify_service

_client = genai.Client(api_key=settings.GEMINI_API_KEY)

# Keep the system instruction and prompt template as named constants so they
# can be iterated on without hunting through business logic.
_SYSTEM_INSTRUCTION = (
    "You are a car modification expert assistant for ShiftMods, an aftermarket parts store. "
    "Your job is to recommend products from the provided catalog that best match the user's "
    "car and stated goal. You must respond ONLY with a valid JSON object — no preamble, "
    "no markdown, no explanation outside the JSON structure."
)

_PROMPT_TEMPLATE = """\
Car: {year} {make} {model}{trim_part}
Goal: {goal}
Budget: {budget}
Additional notes: {notes}

Available catalog:
{catalog_context}

Return a JSON object with this exact shape:
{{
  "summary": "2-3 sentence overview of the recommended build direction",
  "recommended_product_ids": ["shopify_gid_1", "shopify_gid_2"],
  "reasoning": ["one sentence per product explaining why it was chosen"]
}}

Only include product IDs from the catalog above. Do not invent products.
"""

_RETRY_SUFFIX = (
    "\n\nYour previous response was not valid JSON. "
    "Return ONLY the raw JSON object with no markdown, no code fences, and no extra text."
)

_GENERATE_CONFIG = types.GenerateContentConfig(
    system_instruction=_SYSTEM_INSTRUCTION,
)


def build_catalog_context(products: list[dict]) -> str:
    lines = []
    for p in products:
        tags = ", ".join(p["tags"]) if p["tags"] else "none"
        lines.append(
            f"- ID: {p['id']} | {p['title']} | ${p['price']} {p['currency']} | Tags: {tags}\n"
            f"  {p['description'][:200]}"
        )
    return "\n".join(lines)


def build_recommendation_prompt(
    car_profile: UserCarProfile,
    budget_usd: float | None,
    catalog_context: str,
) -> str:
    return _PROMPT_TEMPLATE.format(
        year=car_profile.year,
        make=car_profile.make,
        model=car_profile.model,
        trim_part=f" {car_profile.trim}" if car_profile.trim else "",
        goal=car_profile.goal,
        budget=f"${budget_usd:.0f}" if budget_usd is not None else "No budget constraint",
        notes=car_profile.notes or "None",
        catalog_context=catalog_context,
    )


def _parse_response(text: str) -> RecommendationResponse:
    # Strip markdown code fences if the model ignores our instruction
    cleaned = text.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.split("\n", 1)[-1]
        cleaned = cleaned.rsplit("```", 1)[0].strip()
    return RecommendationResponse.model_validate(json.loads(cleaned))


async def get_recommendations(
    car_profile: UserCarProfile,
    budget_usd: float | None,
) -> RecommendationResponse:
    products = await shopify_service.fetch_catalog()
    catalog_context = build_catalog_context(products)
    prompt = build_recommendation_prompt(car_profile, budget_usd, catalog_context)

    for attempt in range(2):
        full_prompt = prompt if attempt == 0 else prompt + _RETRY_SUFFIX
        response = await _client.aio.models.generate_content(
            model="gemini-2.0-flash",
            contents=full_prompt,
            config=_GENERATE_CONFIG,
        )
        try:
            return _parse_response(response.text)
        except (json.JSONDecodeError, ValidationError, KeyError):
            if attempt == 1:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="The AI service returned an unexpected response. Please try again.",
                )
