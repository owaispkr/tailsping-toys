import { test, expect } from '@playwright/test';

test.describe('Game catalog filters', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('filters immediately by category', async ({ page }) => {
    await page.getByRole('checkbox', { name: 'Strategy' }).check();

    const visibleCards = page.locator('[data-testid="game-card"]:visible');
    await expect(visibleCards).toHaveCount(4);
    await expect(visibleCards.getByTestId('game-category')).toHaveText([
      'Strategy',
      'Strategy',
      'Strategy',
      'Strategy',
    ]);
    await expect(page.getByTestId('filter-results-status')).toHaveText('4 games shown');
  });

  test('filters immediately by publisher', async ({ page }) => {
    await page.getByLabel('Publisher').selectOption({ label: 'CodeForge Studios' });

    const visibleCards = page.locator('[data-testid="game-card"]:visible');
    await expect(visibleCards).toHaveCount(6);
    await expect(visibleCards.getByTestId('game-publisher')).toHaveText([
      'CodeForge Studios',
      'CodeForge Studios',
      'CodeForge Studios',
      'CodeForge Studios',
      'CodeForge Studios',
      'CodeForge Studios',
    ]);
  });

  test('combines multiple categories with a publisher', async ({ page }) => {
    await page.getByRole('checkbox', { name: 'Strategy' }).check();
    await page.getByRole('checkbox', { name: 'Puzzle' }).check();
    await page.getByLabel('Publisher').selectOption({ label: 'CodeForge Studios' });

    const visibleCards = page.locator('[data-testid="game-card"]:visible');
    await expect(visibleCards).toHaveCount(2);
    await expect(visibleCards.getByTestId('game-category')).toHaveText([
      'Puzzle',
      'Strategy',
    ]);
    await expect(visibleCards.getByTestId('game-publisher')).toHaveText([
      'CodeForge Studios',
      'CodeForge Studios',
    ]);
  });

  test('clears all active filters', async ({ page }) => {
    const allCards = page.getByTestId('game-card');
    const totalGames = await allCards.count();

    await page.getByRole('checkbox', { name: 'Strategy' }).check();
    await page.getByLabel('Publisher').selectOption({ label: 'CodeForge Studios' });
    await page.getByTestId('clear-filters').click();

    await expect(page.locator('[data-testid="game-card"]:visible')).toHaveCount(totalGames);
    await expect(page.getByTestId('filter-results-status')).toHaveText(`${totalGames} games shown`);
  });

  test('supports filtering with the keyboard', async ({ page }) => {
    const strategyFilter = page.getByRole('checkbox', { name: 'Strategy' });
    await strategyFilter.focus();
    await page.keyboard.press('Space');

    await expect(strategyFilter).toBeChecked();
    await expect(page.locator('[data-testid="game-card"]:visible')).toHaveCount(4);
  });

  test('shows an empty state when active filters have no matches', async ({ page }) => {
    const publisherFilter = page.getByLabel('Publisher');
    await publisherFilter.evaluate((select) => {
      if (!(select instanceof HTMLSelectElement)) {
        throw new Error('Expected the publisher filter to be a select element.');
      }

      const unmatchedOption = new Option('Publisher without games', 'unmatched');
      select.add(unmatchedOption);
      select.value = unmatchedOption.value;
      select.dispatchEvent(new Event('input', { bubbles: true }));
    });

    await expect(page.getByTestId('games-grid')).toBeHidden();
    await expect(page.getByTestId('filtered-empty-state')).toContainText(
      'No games match the selected filters.',
    );
    await expect(page.getByTestId('filter-results-status')).toHaveText('0 games shown');
  });
});
