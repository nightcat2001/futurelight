async (page) => {
  const baseUrl = process.env.FUTURELIGHT_BASE_URL || 'http://127.0.0.1:37174'
  page.setDefaultTimeout(15_000)
  await page.goto(baseUrl)

  const manifest = await page.evaluate(async () => {
    const response = await fetch('/manifest.webmanifest')
    if (!response.ok) throw new Error(`Manifest returned ${response.status}`)
    return response.json()
  })
  if (manifest.display !== 'standalone') throw new Error('PWA display mode is not standalone')
  if (!manifest.icons?.length) throw new Error('PWA manifest has no icon')

  const registration = await page.evaluate(async () => {
    if (!('serviceWorker' in navigator)) throw new Error('Service workers unsupported')
    const ready = await navigator.serviceWorker.ready
    return { active: Boolean(ready.active), scope: ready.scope }
  })
  if (!registration.active) throw new Error('Service worker did not activate')

  const iconLoaded = await page.evaluate(async (src) => {
    const image = new Image()
    image.src = src
    await image.decode()
    return image.naturalWidth > 0 && image.naturalHeight > 0
  }, manifest.icons[0].src)
  if (!iconLoaded) throw new Error('Manifest icon did not load')
}
