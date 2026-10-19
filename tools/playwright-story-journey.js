async (page) => {
  const browser = page.context().browser()
  const context = browser ? await browser.newContext() : null
  if (context) page = await context.newPage()

  const baseUrl = process.env.FUTURELIGHT_BASE_URL || 'http://127.0.0.1:37173'
  const email = 'playwright-story@futurelight.test'
  const password = 'correct horse battery staple'
  const consoleErrors = []
  const failedRequests = []

  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text())
  })
  page.on('requestfailed', (request) => {
    if (!request.failure()?.errorText.includes('ERR_ABORTED')) {
      failedRequests.push(`${request.method()} ${request.url()} ${request.failure()?.errorText ?? ''}`)
    }
  })
  page.setDefaultTimeout(15_000)

  await page.goto(`${baseUrl}/parent`)
  await page.locator('[role="tablist"]').getByRole('button', { name: 'Create Account' }).click()
  const authForm = page.locator('form.auth-panel')
  await authForm.getByLabel('Email').fill(email)
  await authForm.getByLabel('Display Name').fill('故事測試家長')
  await authForm.getByLabel('Password').fill(password)
  await authForm.getByLabel('Locale').fill('zh-TW')
  await authForm.locator('button[type="submit"]').click()
  await page.getByText('Signed In', { exact: true }).waitFor({ state: 'visible' })

  const childForm = page.locator('form.child-form')
  await childForm.getByLabel('Display Name').fill('小光')
  await childForm.getByLabel('Age Band').selectOption('3-4')
  await childForm.getByLabel('Region').selectOption('US')
  await childForm.getByLabel('English Variant').selectOption('american')
  await childForm.getByLabel('Record parent privacy consent').check()
  await childForm.getByRole('button', { name: 'Create Child' }).click()
  await page.locator('.child-card h2', { hasText: '小光' }).waitFor({ state: 'visible' })

  await page.goto(`${baseUrl}/stories`)
  await page.getByRole('heading', { name: '嗨，小光' }).waitFor({ state: 'visible' })
  await page.getByRole('heading', { name: '小種子找到太陽' }).waitFor({ state: 'visible' })
  await page.screenshot({ fullPage: true, path: 'output/playwright/story-dashboard-desktop.png' })
  await page.getByRole('button', { name: '開始播放' }).click()
  await page.getByText('小種子躺在軟軟的泥土裡。').waitFor({ state: 'visible' })

  for (let pageNumber = 1; pageNumber < 4; pageNumber += 1) {
    await page.getByRole('button', { name: '下一頁' }).click()
  }
  await page.getByRole('button', { name: '故事完成' }).click()
  await page.getByRole('heading', { name: '小光，你聽完了！' }).waitFor({ state: 'visible' })
  await page.getByText('親子聊聊：和孩子一起找家中一個正在長大的東西。').waitFor({ state: 'visible' })

  await page.getByRole('button', { name: '回到今日內容' }).click()
  const taskButton = page.getByRole('button', { name: '完成任務' })
  await taskButton.waitFor({ state: 'visible' })
  await taskButton.click()
  await page.getByRole('button', { name: '今天已完成' }).waitFor({ state: 'visible' })

  await page.goto(`${baseUrl}/bedtime`)
  await page.getByRole('heading', { name: '慢慢安靜下來' }).waitFor({ state: 'visible' })
  await page.getByRole('heading', { name: '月亮小船晚安' }).waitFor({ state: 'visible' })
  await page.getByRole('button', { name: '開始播放' }).click()
  await page.getByText('月亮小船停在窗邊，輕輕搖呀搖。').waitFor({ state: 'visible' })
  await page.getByText('把螢幕亮度調低，跟著每頁提示做一次慢呼吸。').waitFor({ state: 'visible' })

  await page.setViewportSize({ width: 390, height: 844 })
  await page.getByText('月亮小船停在窗邊，輕輕搖呀搖。').waitFor({ state: 'visible' })
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
  if (overflow) throw new Error('Mobile layout has horizontal overflow')

  const brokenImages = await page.locator('img').evaluateAll((images) =>
    images.filter((image) => !image.complete || image.naturalWidth === 0).map((image) => image.getAttribute('src')),
  )
  if (brokenImages.length) throw new Error(`Broken images: ${brokenImages.join(', ')}`)
  if (failedRequests.length) throw new Error(`Failed requests: ${failedRequests.join(', ')}`)
  if (consoleErrors.length) throw new Error(`Console errors: ${consoleErrors.join(' | ')}`)

  await page.screenshot({ fullPage: true, path: 'output/playwright/story-journey-bedtime-mobile.png' })
  if (context) await context.close()
}
