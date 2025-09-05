import { useEffect, useMemo, useRef, useState } from 'react'
import axios, { type AxiosRequestConfig } from 'axios'
import { http } from '@common/api/http.ts'

type UseRequestOptions<T> = {
  immediate?: boolean
  config: AxiosRequestConfig<T>
  deps?: ReadonlyArray<unknown>
}

type UseRequestState<T> = {
  data: T | null
  loading: boolean
  error: unknown
}

export function useRequest<T = unknown>({ config, immediate = true, deps }: UseRequestOptions<T>) {
  const [state, setState] = useState<UseRequestState<T>>({
    data: null,
    loading: immediate,
    error: null
  })
  const abortRef = useRef<AbortController | null>(null)

  const memoDeps = deps ?? [
    config.url,
    config.method,
    JSON.stringify(config.params ?? {}),
    JSON.stringify(config.data ?? {})
  ]

  const run = useMemo(
    () => async (override?: Partial<AxiosRequestConfig<T>>) => {
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller
      setState(s => ({ ...s, loading: true, error: null }))
      try {
        const res = await http.request<T>({
          ...config,
          ...override,
          signal: controller.signal
        })
        setState({ data: res.data, loading: false, error: null })
        return res.data
      } catch (err) {
        if (axios.isCancel(err)) return
        setState(s => ({ ...s, loading: false, error: err }))
        throw err
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    memoDeps
  )

  useEffect(() => {
    if (!immediate) return
    void run()
    return () => abortRef.current?.abort()
  }, [immediate, run])

  return { ...state, run }
}
