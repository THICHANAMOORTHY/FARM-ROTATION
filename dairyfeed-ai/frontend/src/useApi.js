import { useCallback, useEffect, useState } from 'react'

import { apiGet } from './api'

// Loads `path` from the API. Reloads when `path` changes, and every `refreshMs` if given.
// Pass path = null to load nothing.
export function useApi(path, { refreshMs } = {}) {
  const [state, setState] = useState({ data: null, error: null })
  const [reloadCount, setReloadCount] = useState(0)
  const reload = useCallback(() => setReloadCount((n) => n + 1), [])

  useEffect(() => {
    if (!path) return undefined
    const controller = new AbortController()
    apiGet(path, { signal: controller.signal })
      .then((data) => setState({ data, error: null }))
      .catch((error) => {
        if (error.name !== 'AbortError') setState((s) => ({ ...s, error }))
      })
    return () => controller.abort()
  }, [path, reloadCount])

  useEffect(() => {
    if (!refreshMs) return undefined
    const timer = setInterval(reload, refreshMs)
    return () => clearInterval(timer)
  }, [refreshMs, reload])

  // Still loading while nothing (neither data nor an error) has arrived for a path.
  const loading = Boolean(path) && state.data === null && state.error === null
  return { ...state, loading, reload }
}
