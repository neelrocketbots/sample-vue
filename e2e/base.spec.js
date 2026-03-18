import { test, expect } from './fixture'

// See here how to get started:
// https://playwright.dev/docs/intro
test('visits the app root url', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('h1')).toHaveText('You did it!')
})

test('increments the counter', async ({ page }) => {
  await page.goto('/')
  const count = page.locator('p').first()
  await expect(count).toHaveText('0')
  await page.getByRole('button', { name: 'Increment' }).click()
  await expect(count).toHaveText('1')
})
