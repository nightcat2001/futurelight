async (page) => {
  const browser = page.context().browser()
  const isolatedContext = browser ? await browser.newContext() : null
  if (isolatedContext) {
    page = await isolatedContext.newPage()
  }

  const baseUrl = 'http://127.0.0.1:37173'
  const email = 'playwright-e2e@futurelight.test'
  const password = 'correct horse battery staple'

  page.setDefaultTimeout(15_000)

  async function requireVisible(locator, label) {
    try {
      await locator.first().waitFor({ state: 'visible' })
    } catch (error) {
      const safeLabel = label.replace(/[^a-z0-9-]+/gi, '-').toLowerCase()
      await page.screenshot({
        fullPage: true,
        path: `output/playwright/e2e-failure-${safeLabel}.png`,
      }).catch(() => {})
      const bodyText = await page.locator('body').innerText().catch(() => '<body unavailable>')
      throw new Error(`Expected visible element: ${label}\n${bodyText}`, { cause: error })
    }
    const count = await locator.count()
    if (count < 1) {
      throw new Error(`Expected visible element: ${label}`)
    }
  }

  await page.goto(baseUrl)
  await page.evaluate(() => localStorage.clear())
  await page.goto(`${baseUrl}/parent`)
  await requireVisible(page.getByRole('heading', { name: 'Parent Center' }), 'Parent Center')
  await requireVisible(page.getByText('API connected'), 'API connected')

  await page.getByRole('button', { name: 'Create Account' }).click()
  const authForm = page.locator('form.auth-panel')
  await authForm.getByLabel('Email').fill(email)
  await authForm.getByLabel('Display Name').fill('Playwright Parent')
  await authForm.getByLabel('Password').fill(password)
  await authForm.getByLabel('Locale').fill('en-US')
  const registerResponsePromise = page.waitForResponse(
    (response) => response.url().includes('/api/auth/register') && response.request().method() === 'POST',
  )
  await authForm.locator('button[type="submit"]').click()
  const registerResponse = await registerResponsePromise
  if (!registerResponse.ok()) {
    throw new Error(`register failed: ${registerResponse.status()} ${await registerResponse.text()}`)
  }

  await requireVisible(page.getByText('Signed In'), 'signed in state')
  await requireVisible(page.getByRole('heading', { name: 'Create child profile' }), 'child profile form')

  const childForm = page.locator('form.child-form')
  await childForm.getByLabel('Display Name').fill('Avery US')
  await childForm.getByLabel('Age Band').selectOption('6-8')
  await childForm.getByLabel('Region').selectOption('US')
  await childForm.getByLabel('English Variant').selectOption('american')
  await childForm.getByLabel('Record parent privacy consent').check()
  await childForm.getByRole('button', { name: 'Create Child' }).click()
  await requireVisible(page.getByText('Avery US'), 'created child profile')
  await requireVisible(page.getByText('granted'), 'granted consent record')

  await page.getByRole('button', { name: 'Sign Out' }).click()
  await requireVisible(page.locator('form.auth-panel'), 'signed-out auth form')
  await page.locator('[role="tablist"]').getByRole('button', { name: 'Sign In' }).click()
  await authForm.getByLabel('Email').fill(email)
  await authForm.getByLabel('Password').fill(password)
  await authForm.locator('button[type="submit"]').click()
  await requireVisible(page.getByText('Signed In'), 'login after sign out')
  await requireVisible(page.getByText('Avery US'), 'child profile after login')
  const tokenAfterLogin = await page.evaluate(() => localStorage.getItem('futurelight.parentToken'))
  if (!tokenAfterLogin) {
    throw new Error('Missing futurelight.parentToken after login.')
  }
  const meResponse = await page.request.get(`${baseUrl}/api/auth/me`, {
    headers: {
      Authorization: `Bearer ${tokenAfterLogin}`,
    },
  })
  if (!meResponse.ok()) {
    throw new Error(`auth/me failed after login: ${meResponse.status()} ${await meResponse.text()}`)
  }

  await page.goto(`${baseUrl}/learn`)
  const tokenOnLearn = await page.evaluate(() => localStorage.getItem('futurelight.parentToken'))
  if (!tokenOnLearn) {
    throw new Error('Missing futurelight.parentToken after navigating to /learn.')
  }
  await requireVisible(page.getByRole('heading', { name: 'Learning Player' }), 'learning route')
  await requireVisible(page.getByText('US / american'), 'child content selection')
  await page.getByRole('button', { name: 'Start Session' }).click()
  await requireVisible(page.getByRole('button', { name: 'Session Started' }), 'started learning session')
  await page.getByRole('button', { name: 'Mark Correct' }).click()
  await requireVisible(page.getByText('Activity Mastery'), 'reward after correct learning attempt')
  await page.getByRole('button', { name: 'Complete Session' }).click()

  await page.goto(`${baseUrl}/practice`)
  await requireVisible(page.getByRole('heading', { name: 'Practice Game' }), 'practice route')
  await requireVisible(page.getByText('US / american'), 'practice content selection')
  const firstChoice = page.locator('.choice-button').first()
  await requireVisible(firstChoice, 'practice choices')
  await firstChoice.click()
  await requireVisible(page.locator('.result-banner'), 'practice result banner')

  await page.goto(`${baseUrl}/parent`)
  await requireVisible(page.getByRole('heading', { name: 'Progress By Child' }), 'parent summary')
  await requireVisible(page.getByText('Avery US'), 'parent summary child')
  await requireVisible(page.getByText('Recorded Consent'), 'privacy consent panel')

  await page.goto(`${baseUrl}/courses`)
  await requireVisible(page.getByRole('heading', { name: 'Course Library' }), 'course library')
  await requireVisible(page.getByText('Color English Words'), 'seeded color course')

  if (isolatedContext) {
    await isolatedContext.close()
  }
}
