import { useEffect, useState } from 'react'

// A tiny hash router: #/history, #/sample/DF01-..., #/label/DF01-..., #/devices.
// Hash URLs work on any static host without server configuration.
function currentRoute() {
  const parts = window.location.hash.replace(/^#\/?/, '').split('/').map(decodeURIComponent)
  return { page: parts[0] || 'dashboard', param: parts[1] || '' }
}

export function useRoute() {
  const [route, setRoute] = useState(currentRoute)
  useEffect(() => {
    const onChange = () => {
      setRoute(currentRoute())
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return route
}

export function href(page, param) {
  if (page === 'dashboard') return '#/'
  return param ? `#/${page}/${encodeURIComponent(param)}` : `#/${page}`
}
