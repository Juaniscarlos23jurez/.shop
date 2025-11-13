import { NextResponse } from 'next/server'

const BASE_URL = 'https://laravel-pkpass-backend-development-pfaawl.laravel.cloud'

async function forward(req: Request, path: string) {
  const url = new URL(req.url)
  const targetUrl = `${BASE_URL}/${path}${url.search}`

  const headers = new Headers()
  // Forward essential headers
  const auth = req.headers.get('authorization')
  if (auth) headers.set('authorization', auth)
  headers.set('accept', 'application/json')
  // Content-Type only when there is a body
  const contentType = req.headers.get('content-type')
  if (contentType) headers.set('content-type', contentType)

  const init: RequestInit = {
    method: req.method,
    headers,
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    const body = await req.arrayBuffer()
    init.body = body
  }

  const res = await fetch(targetUrl, init)
  const data = await res.arrayBuffer()

  const response = new NextResponse(data, {
    status: res.status,
  })

  // Mirror important headers
  res.headers.forEach((value, key) => {
    if (key.toLowerCase() === 'content-type') {
      response.headers.set('content-type', value)
    }
  })

  return response
}

export async function GET(
  req: Request,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params
  const joinedPath = path.join('/')
  return forward(req, joinedPath)
}

export async function POST(
  req: Request,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params
  const joinedPath = path.join('/')
  return forward(req, joinedPath)
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params
  const joinedPath = path.join('/')
  return forward(req, joinedPath)
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params
  const joinedPath = path.join('/')
  return forward(req, joinedPath)
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params
  const joinedPath = path.join('/')
  return forward(req, joinedPath)
}

