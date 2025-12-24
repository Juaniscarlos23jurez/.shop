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

  try {
    const res = await fetch(targetUrl, init)
    const data = await res.arrayBuffer()

    // Log backend errors for debugging
    if (!res.ok) {
      const errorText = new TextDecoder().decode(data)
      console.error('Backend Error Response:', {
        status: res.status,
        statusText: res.statusText,
        url: targetUrl,
        errorBody: errorText
      })
    }

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
  } catch (error) {
    console.error('Proxy forward error:', {
      targetUrl,
      method: req.method,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    throw error
  }
}

export async function GET(
  req: Request,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params
  const joinedPath = path.join('/')
  
  try {
    return forward(req, joinedPath)
  } catch (error) {
    console.error('Proxy GET Error for path:', joinedPath, error)
    return NextResponse.json(
      { error: 'Proxy request failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
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

