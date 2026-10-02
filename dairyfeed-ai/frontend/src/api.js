// All calls to the FastAPI backend. In development Vite forwards /api to localhost:8000.
const BASE = import.meta.env.VITE_API_URL || ''

async function errorMessage(response) {
  try {
    const body = await response.json()
    if (typeof body.detail === 'string') return body.detail
    if (Array.isArray(body.detail)) return body.detail.map((d) => d.msg).join('; ')
  } catch {
    // not JSON
  }
  return `HTTP ${response.status}`
}

export async function apiGet(path, { signal } = {}) {
  const response = await fetch(BASE + path, { signal })
  if (!response.ok) {
    const error = new Error(await errorMessage(response))
    error.status = response.status
    throw error
  }
  return response.json()
}

export async function apiPost(path, body, headers = {}) {
  const response = await fetch(BASE + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  })
  if (!response.ok) throw new Error(await errorMessage(response))
  return response.json()
}

export function imageUrl(sampleId) {
  return `${BASE}/api/silage/${encodeURIComponent(sampleId)}/image`
}

// Builds "?a=1&b=2", skipping empty values.
export function query(params) {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== '' && value !== null && value !== undefined) search.set(key, value)
  }
  const text = search.toString()
  return text ? `?${text}` : ''
}
