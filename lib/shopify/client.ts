const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN
const accessToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN

if (!domain) throw new Error('NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN is not set')
if (!accessToken) throw new Error('SHOPIFY_STOREFRONT_ACCESS_TOKEN is not set')

const endpoint = `https://${domain}/api/2025-01/graphql.json`

type GraphQLResponse<T> = {
  data: T
  errors?: { message: string }[]
}

export async function shopifyFetch<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': accessToken!,
    },
    body: JSON.stringify({ query, variables }),
    next: { tags: ['shopify'] },
  })

  if (!res.ok) {
    throw new Error(
      `Shopify Storefront API error: ${res.status} ${res.statusText} — ${await res.text()}`,
    )
  }

  const json = (await res.json()) as GraphQLResponse<T>

  if (json.errors?.length) {
    throw new Error(
      `Shopify GraphQL errors: ${json.errors.map((e) => e.message).join(', ')}`,
    )
  }

  return json.data
}
