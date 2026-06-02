async (page) => {
  const browser = page.context().browser()
  const isolatedContext = browser ? await browser.newContext() : null
  if (isolatedContext) {
    page = await isolatedContext.newPage()
  }

  const baseUrl = 'http://127.0.0.1:37173'
  const email = 'playwright-visual@futurelight.test'
  const password = 'correct horse battery staple'

  page.setDefaultTimeout(15_000)

  async function requestJson(response, label) {
    if (!response.ok()) {
      throw new Error(`${label} failed: ${response.status()} ${await response.text()}`)
    }
    return response.json()
  }

  const auth = await requestJson(
    await page.request.post(`${baseUrl}/api/auth/register`, {
      data: {
        display_name: 'Visual Smoke Parent',
        email,
        locale: 'en-US',
        password,
      },
    }),
    'register visual parent',
  )

  const child = await requestJson(
    await page.request.post(`${baseUrl}/api/children`, {
      data: {
        age_band: '6-8',
        display_name: 'Avery Visual',
        english_variant: 'british',
        market_region: 'UK',
      },
      headers: {
        Authorization: `Bearer ${auth.session.token}`,
      },
    }),
    'create visual child',
  )

  await requestJson(
    await page.request.post(`${baseUrl}/api/privacy/consents`, {
      data: {
        child_id: child.id,
        consent_type: 'parental_privacy',
        evidence: {
          age_band: '6-8',
          source: 'playwright_visual_smoke',
        },
      },
      headers: {
        Authorization: `Bearer ${auth.session.token}`,
      },
    }),
    'record visual consent',
  )

  const routes = [
    { name: 'home', path: '/', heading: 'Start a focused English session.' },
    { name: 'courses', path: '/courses', heading: 'Course Library' },
    { name: 'learn', path: '/learn', heading: 'Learning Player' },
    { name: 'practice', path: '/practice', heading: 'Practice Game' },
    { name: 'parent', path: '/parent', heading: 'Parent Center' },
  ]

  const viewports = [
    { name: 'desktop', width: 1440, height: 900 },
    { name: 'mobile', width: 390, height: 844 },
  ]

  async function assertVisualBasics(viewportName, routeName) {
    await page.waitForFunction(() => Array.from(document.images).every((image) => image.complete))

    const issues = await page.evaluate(() => {
      const failures = []
      const documentWidth = document.documentElement.scrollWidth
      if (documentWidth > window.innerWidth + 2) {
        failures.push(`horizontal overflow: ${documentWidth}px > ${window.innerWidth}px`)
      }

      const visible = (element) => {
        const style = window.getComputedStyle(element)
        const rect = element.getBoundingClientRect()
        return (
          style.visibility !== 'hidden' &&
          style.display !== 'none' &&
          rect.width > 0 &&
          rect.height > 0
        )
      }

      for (const button of Array.from(document.querySelectorAll('button'))) {
        if (!visible(button)) continue
        if (button.scrollWidth > button.clientWidth + 2) {
          failures.push(`button text overflow: ${button.textContent?.trim() ?? 'unnamed button'}`)
        }
      }

      if (!Array.from(document.querySelectorAll('button')).some(visible)) {
        failures.push('no visible buttons')
      }

      for (const image of Array.from(document.images)) {
        if (!visible(image)) continue
        if (image.naturalWidth === 0 || image.naturalHeight === 0) {
          failures.push(`broken image: ${image.getAttribute('alt') || image.getAttribute('src') || 'unnamed image'}`)
        }
      }

      return failures
    })

    if (issues.length > 0) {
      throw new Error(`${viewportName}/${routeName} visual smoke failed: ${issues.join('; ')}`)
    }

    const clickableButton = page.locator('button:visible:not([disabled])').first()
    if ((await clickableButton.count()) > 0) {
      await clickableButton.click({ trial: true })
    }
  }

  await page.addInitScript((token) => {
    localStorage.clear()
    localStorage.setItem('futurelight.parentToken', token)
  }, auth.session.token)

  await page.goto(`${baseUrl}/parent`)
  await page.getByRole('heading', { name: 'Avery Visual' }).first().waitFor({ state: 'visible' })

  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height })

    for (const route of routes) {
      await page.goto(`${baseUrl}${route.path}`)
      await page.getByRole('heading', { name: route.heading }).waitFor({ state: 'visible' })
      if (route.name === 'courses') {
        await page.getByRole('heading', { name: 'lion-word' }).waitFor({ state: 'visible' })
      }
      if (route.name === 'parent') {
        await page.getByRole('heading', { name: 'Avery Visual' }).first().waitFor({ state: 'visible' })
      }
      if (['learn', 'practice'].includes(route.name)) {
        await page.getByText('UK / british').waitFor({ state: 'visible' })
      }
      await page.waitForTimeout(400)
      await assertVisualBasics(viewport.name, route.name)
      await page.screenshot({
        fullPage: true,
        path: `output/playwright/visual-smoke/${viewport.name}-${route.name}.png`,
      })
    }
  }

  if (isolatedContext) {
    await isolatedContext.close()
  }
}
