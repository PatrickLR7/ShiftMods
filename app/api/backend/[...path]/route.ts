import { NextRequest, NextResponse } from 'next/server'

// Server-side only — never exposed to the browser
const BACKEND_URL = process.env.API_URL!

type Params = Promise<{ path: string[] }>

async function proxy(req: NextRequest, params: Params): Promise<NextResponse> {
  const { path } = await params
  const url = `${BACKEND_URL}/${path.join('/')}${req.nextUrl.search}`

  const headers: Record<string, string> = {}

  const contentType = req.headers.get('content-type')
  if (contentType) headers['Content-Type'] = contentType

  // Forward the browser's cookies to FastAPI (access_token lives on Vercel domain)
  const cookie = req.headers.get('cookie')
  if (cookie) headers['Cookie'] = cookie

  const upstream = await fetch(url, {
    method: req.method,
    headers,
    body: req.method !== 'GET' && req.method !== 'HEAD' ? await req.text() : undefined,
  })

  const body = await upstream.text()
  const response = new NextResponse(body, {
    status: upstream.status,
    headers: {
      'Content-Type': upstream.headers.get('content-type') ?? 'application/json',
    },
  })

  // Forward any Set-Cookie headers from FastAPI (e.g. token rotation on refresh)
  upstream.headers.getSetCookie().forEach((c) => {
    response.headers.append('Set-Cookie', c)
  })

  return response
}

export async function GET(req: NextRequest, { params }: { params: Params }) {
  return proxy(req, params)
}
export async function POST(req: NextRequest, { params }: { params: Params }) {
  return proxy(req, params)
}
export async function PUT(req: NextRequest, { params }: { params: Params }) {
  return proxy(req, params)
}
export async function DELETE(req: NextRequest, { params }: { params: Params }) {
  return proxy(req, params)
}
