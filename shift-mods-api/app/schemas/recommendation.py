from pydantic import BaseModel


class RecommendationRequest(BaseModel):
    budget_usd: float | None = None


class RecommendationResponse(BaseModel):
    summary: str
    recommended_product_ids: list[str]
    reasoning: list[str]
