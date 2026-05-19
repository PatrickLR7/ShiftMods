import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.API_URL!

export async function POST(request: NextRequest) {
  const body = await request.json()

  const upstream = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  const data = await upstream.json()

  if (!upstream.ok) {
    return NextResponse.json(data, { status: upstream.status })
  }

  const response = NextResponse.json(data, { status: 200 })

  // Transfer Set-Cookie headers from FastAPI to the browser
  upstream.headers.getSetCookie().forEach((cookie) => {
    response.headers.append('Set-Cookie', cookie)
  })

  return response
}
