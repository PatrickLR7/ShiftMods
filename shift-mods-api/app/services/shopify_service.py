import httpx
from fastapi import HTTPException, status

from app.config import settings

_CATALOG_QUERY = """
{
  products(first: 50) {
    edges {
      node {
        id
        title
        description
        tags
        handle
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
      }
    }
  }
}
"""


async def fetch_catalog(limit: int = 50) -> list[dict]:
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post(
                settings.SHOPIFY_STOREFRONT_API_URL,
                json={"query": _CATALOG_QUERY},
                headers={
                    "X-Shopify-Storefront-Access-Token": settings.SHOPIFY_STOREFRONT_ACCESS_TOKEN,
                    "Content-Type": "application/json",
                },
            )
            response.raise_for_status()
    except httpx.HTTPError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Failed to fetch product catalog from Shopify: {exc}",
        )

    data = response.json()
    edges = data.get("data", {}).get("products", {}).get("edges", [])

    return [
        {
            "id": node["id"],
            "title": node["title"],
            "description": node.get("description", ""),
            "tags": node.get("tags", []),
            "handle": node.get("handle", ""),
            "price": node["priceRange"]["minVariantPrice"]["amount"],
            "currency": node["priceRange"]["minVariantPrice"]["currencyCode"],
        }
        for edge in edges
        if (node := edge["node"])
    ]
