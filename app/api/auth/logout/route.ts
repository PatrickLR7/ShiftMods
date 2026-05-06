import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL!

export async function POST(request: NextRequest) {
  const accessToken = request.cookies.get('access_token')?.value

  await fetch(`${API_URL}/auth/logout`, {
    method: 'POST',
    headers: accessToken ? { Cookie: `access_token=${accessToken}` } : {},
  }).catch(() => {})

  const response = NextResponse.json({ ok: true })
  response.cookies.delete('access_token')
  response.cookies.delete('refresh_token')
  return response
}
