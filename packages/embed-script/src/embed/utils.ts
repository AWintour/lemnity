const isLocalHost = (host: string) =>
  host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0'

const isLanHost = (host: string) =>
  /^10\./.test(host) || /^192\.168\./.test(host) || /^172\.(1[6-9]|2\d|3[0-1])\./.test(host)

const isLocalOrLanHost = (host: string) => isLocalHost(host) || isLanHost(host)

export const getApiBase = () => {
  const { hostname } = window.location
  if (isLocalOrLanHost(hostname)) {
    const apiHost = isLanHost(hostname) ? hostname : 'localhost'
    return `http://${apiHost}:3000/api`
  }

  return 'https://app.lemnity.ru/api'
}

export const buildPublicWidgetUrl = (widgetId: string, apiBase?: string) => {
  const base = apiBase ?? getApiBase()
  return `${base}/public/widgets/${encodeURIComponent(widgetId)}`
}
