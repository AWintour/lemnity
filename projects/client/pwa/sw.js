/* Service worker кабинета Lemnity: web-push уведомления операторам о новых сообщениях.
   Намеренно минимальный — без кэширования/офлайна (только push + клик по нотификации). */

self.addEventListener('install', () => {
  // Сразу активируем новый SW, не дожидаясь закрытия вкладок.
  self.skipWaiting()
})

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('push', event => {
  let data = {}
  try {
    data = event.data ? event.data.json() : {}
  } catch {
    data = { title: 'Новое сообщение', body: event.data ? event.data.text() : '' }
  }
  const title = data.title || 'Новое сообщение'
  const url = data.url || '/'
  const options = {
    body: data.body || '',
    icon: '/pwa-icon.svg',
    badge: '/pwa-icon.svg',
    // tag схлопывает серию уведомлений по одному диалогу в одно.
    tag: data.tag || undefined,
    renotify: !!data.tag,
    data: { url },
  }
  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', event => {
  event.notification.close()
  const targetUrl = (event.notification.data && event.notification.data.url) || '/'
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
      // Если кабинет уже открыт — фокусируем его и ведём на нужный экран.
      for (const client of clients) {
        if ('focus' in client) {
          client.navigate?.(targetUrl)
          return client.focus()
        }
      }
      return self.clients.openWindow ? self.clients.openWindow(targetUrl) : undefined
    })
  )
})
