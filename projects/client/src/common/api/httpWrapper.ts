// Простой и читаемый ретрай-хелпер поверх http
import type { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios'
import { http } from '@common/api/http.ts'

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

const isRetryable = (err: unknown) => {
  const e = err as AxiosError
  const s = e.response?.status
  // 5xx/429/ или нет статуса — пробуем повторить
  return !s || s >= 500 || s === 429
}

type RequestOptions<TRequest = unknown> = {
  method?: AxiosRequestConfig<TRequest>['method']
  params?: AxiosRequestConfig<TRequest>['params']
  data?: AxiosRequestConfig<TRequest>['data']
  headers?: AxiosRequestConfig<TRequest>['headers']
  retries?: number
  delayMs?: number
}

export async function request<TResponse = unknown, TRequest = unknown>(
  url: string,
  {
    method = 'GET',
    params,
    data,
    headers,
    retries = 3,
    delayMs = 300
  }: RequestOptions<TRequest> = {}
): Promise<AxiosResponse<TResponse>> {
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      return await http.request<TResponse, AxiosResponse<TResponse>, TRequest>({
        url,
        method,
        params,
        data: data as TRequest,
        headers
      })
    } catch (err) {
      if (attempt === retries || !isRetryable(err)) throw err
      await sleep(delayMs)
      delayMs *= 2
    }
  }
  // для успокоения линтера
  throw new Error('unreachable')
}
