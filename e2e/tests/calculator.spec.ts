import { test, expect } from '@playwright/test';

test.describe('電卓アプリケーション E2E テスト', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    // 履歴をクリアして初期状態にする
    await page.getByText('履歴クリア').click();
    await page.waitForTimeout(500); // APIレスポンス待機
  });

  test.describe('基本機能', () => {
    test('ページが正常に読み込まれる', async ({ page }) => {
      await expect(page).toHaveTitle(/電卓アプリ/);
      await expect(page.getByText('電卓アプリ')).toBeVisible();
      await expect(page.getByDisplayValue('0')).toBeVisible();
    });

    test('数字の入力と表示', async ({ page }) => {
      await page.getByText('1').click();
      await page.getByText('2').click();
      await page.getByText('3').click();
      
      await expect(page.getByDisplayValue('123')).toBeVisible();
    });

    test('小数点を含む数字の入力', async ({ page }) => {
      await page.getByText('3').click();
      await page.getByText('.').click();
      await page.getByText('1').click();
      await page.getByText('4').click();
      
      await expect(page.getByDisplayValue('3.14')).toBeVisible();
    });
  });

  test.describe('基本計算', () => {
    test('足し算の計算', async ({ page }) => {
      await page.getByText('5').click();
      await page.getByText('+').click();
      await page.getByText('3').click();
      await page.getByText('=').click();
      
      // 結果の確認
      await expect(page.getByDisplayValue('8')).toBeVisible({ timeout: 5000 });
      
      // 履歴に表示されることを確認
      await expect(page.getByText('5 + 3 = 8')).toBeVisible({ timeout: 2000 });
    });

    test('引き算の計算', async ({ page }) => {
      await page.getByText('1').click();
      await page.getByText('0').click();
      await page.getByText('−').click(); // マイナス記号
      await page.getByText('4').click();
      await page.getByText('=').click();
      
      await expect(page.getByDisplayValue('6')).toBeVisible({ timeout: 5000 });
      await expect(page.getByText('10 - 4 = 6')).toBeVisible({ timeout: 2000 });
    });

    test('掛け算の計算', async ({ page }) => {
      await page.getByText('7').click();
      await page.getByText('×').click();
      await page.getByText('8').click();
      await page.getByText('=').click();
      
      await expect(page.getByDisplayValue('56')).toBeVisible({ timeout: 5000 });
      await expect(page.getByText('7 * 8 = 56')).toBeVisible({ timeout: 2000 });
    });

    test('割り算の計算', async ({ page }) => {
      await page.getByText('1').click();
      await page.getByText('5').click();
      await page.getByText('÷').click();
      await page.getByText('3').click();
      await page.getByText('=').click();
      
      await expect(page.getByDisplayValue('5')).toBeVisible({ timeout: 5000 });
      await expect(page.getByText('15 / 3 = 5')).toBeVisible({ timeout: 2000 });
    });

    test('複雑な計算式', async ({ page }) => {
      await page.getByText('2').click();
      await page.getByText('+').click();
      await page.getByText('3').click();
      await page.getByText('×').click();
      await page.getByText('4').click();
      await page.getByText('=').click();
      
      await expect(page.getByDisplayValue('14')).toBeVisible({ timeout: 5000 });
      await expect(page.getByText('2 + 3 * 4 = 14')).toBeVisible({ timeout: 2000 });
    });

    test('小数点を含む計算', async ({ page }) => {
      await page.getByText('3').click();
      await page.getByText('.').click();
      await page.getByText('1').click();
      await page.getByText('4').click();
      await page.getByText('×').click();
      await page.getByText('2').click();
      await page.getByText('=').click();
      
      // 6.28の結果を期待
      await expect(page.getByDisplayValue(/^6\.28/)).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('税計算', () => {
    test('税込み計算', async ({ page }) => {
      await page.getByText('1').click();
      await page.getByText('0').click();
      await page.getByText('0').click();
      await page.getByText('税込').click();
      
      await expect(page.getByDisplayValue('110')).toBeVisible({ timeout: 5000 });
      await expect(page.getByText('100 → 110 (税込)')).toBeVisible({ timeout: 2000 });
    });

    test('税抜き計算', async ({ page }) => {
      await page.getByText('1').click();
      await page.getByText('1').click();
      await page.getByText('0').click();
      await page.getByText('税抜').click();
      
      await expect(page.getByDisplayValue('100')).toBeVisible({ timeout: 5000 });
      await expect(page.getByText('110 → 100 (税抜)')).toBeVisible({ timeout: 2000 });
    });

    test('小数点を含む税計算', async ({ page }) => {
      await page.getByText('1').click();
      await page.getByText('2').click();
      await page.getByText('3').click();
      await page.getByText('.').click();
      await page.getByText('4').click();
      await page.getByText('5').click();
      await page.getByText('税込').click();
      
      await expect(page.getByDisplayValue('135.8')).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('エラーハンドリング', () => {
    test('ゼロ除算エラー', async ({ page }) => {
      await page.getByText('5').click();
      await page.getByText('÷').click();
      await page.getByText('0').click();
      await page.getByText('=').click();
      
      await expect(page.getByDisplayValue('エラー')).toBeVisible({ timeout: 5000 });
      await expect(page.getByText('ゼロで割ることはできません')).toBeVisible({ timeout: 2000 });
    });

    test('エラー後の復旧', async ({ page }) => {
      // エラーを発生させる
      await page.getByText('5').click();
      await page.getByText('÷').click();
      await page.getByText('0').click();
      await page.getByText('=').click();
      
      await expect(page.getByDisplayValue('エラー')).toBeVisible({ timeout: 5000 });
      
      // ACでクリアして新しい計算
      await page.getByText('AC').click();
      await page.getByText('2').click();
      await page.getByText('+').click();
      await page.getByText('3').click();
      await page.getByText('=').click();
      
      await expect(page.getByDisplayValue('5')).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('クリア機能', () => {
    test('ACボタンによる全クリア', async ({ page }) => {
      await page.getByText('1').click();
      await page.getByText('2').click();
      await page.getByText('3').click();
      await page.getByText('+').click();
      await page.getByText('4').click();
      await page.getByText('5').click();
      
      await page.getByText('AC').click();
      
      await expect(page.getByDisplayValue('0')).toBeVisible();
    });

    test('Cボタンによる表示クリア', async ({ page }) => {
      await page.getByText('1').click();
      await page.getByText('2').click();
      await page.getByText('3').click();
      
      await page.getByText('C').click();
      
      await expect(page.getByDisplayValue('0')).toBeVisible();
    });

    test('バックスペースによる一文字削除', async ({ page }) => {
      await page.getByText('1').click();
      await page.getByText('2').click();
      await page.getByText('3').click();
      
      await page.getByText('⌫').click();
      
      await expect(page.getByDisplayValue('12')).toBeVisible();
    });
  });

  test.describe('一時保存機能', () => {
    test('一時保存と読み込み', async ({ page }) => {
      await page.getByText('1').click();
      await page.getByText('2').click();
      await page.getByText('3').click();
      await page.getByText('+').click();
      await page.getByText('4').click();
      await page.getByText('5').click();
      
      // 一時保存
      await page.getByText('一時保存').click();
      
      // クリア
      await page.getByText('AC').click();
      await expect(page.getByDisplayValue('0')).toBeVisible();
      
      // 読み込み
      await page.getByText('読込').click();
      await expect(page.getByDisplayValue('45')).toBeVisible();
    });
  });

  test.describe('キーボード操作', () => {
    test('キーボードでの数字入力', async ({ page }) => {
      const display = page.getByDisplayValue('0');
      await display.focus();
      
      await page.keyboard.type('123');
      await expect(page.getByDisplayValue('123')).toBeVisible();
    });

    test('キーボードでの計算実行', async ({ page }) => {
      const display = page.getByDisplayValue('0');
      await display.focus();
      
      await page.keyboard.type('10 + 5');
      await page.keyboard.press('Enter');
      
      await expect(page.getByDisplayValue('15')).toBeVisible({ timeout: 5000 });
    });

    test('キーボードでのバックスペース', async ({ page }) => {
      const display = page.getByDisplayValue('0');
      await display.focus();
      
      await page.keyboard.type('456');
      await page.keyboard.press('Backspace');
      
      await expect(page.getByDisplayValue('45')).toBeVisible();
    });
  });

  test.describe('履歴機能', () => {
    test('計算履歴の表示と蓄積', async ({ page }) => {
      // 複数の計算を実行
      const calculations = [
        { expression: '5 + 3', result: '8' },
        { expression: '10 - 4', result: '6' },
        { expression: '7 × 8', display: '7 * 8 = 56' }
      ];
      
      for (const calc of calculations) {
        await page.getByDisplayValue(/\d+/).fill('');
        const keys = calc.expression.split('');
        for (const key of keys) {
          if (key === ' ') continue;
          if (key === '×') {
            await page.getByText('×').click();
          } else if (key === '+') {
            await page.getByText('+').click();
          } else if (key === '-') {
            await page.getByText('−').click();
          } else {
            await page.getByText(key).click();
          }
        }
        await page.getByText('=').click();
        await page.waitForTimeout(1000);
      }
      
      // 履歴が表示されることを確認
      await expect(page.getByText('7 * 8 = 56')).toBeVisible();
      await expect(page.getByText('10 - 4 = 6')).toBeVisible();
      await expect(page.getByText('5 + 3 = 8')).toBeVisible();
    });

    test('履歴のフィルタリング', async ({ page }) => {
      // 基本計算を実行
      await page.getByText('5').click();
      await page.getByText('+').click();
      await page.getByText('3').click();
      await page.getByText('=').click();
      await page.waitForTimeout(1000);
      
      // 税計算を実行
      await page.getByText('AC').click();
      await page.getByText('1').click();
      await page.getByText('0').click();
      await page.getByText('0').click();
      await page.getByText('税込').click();
      await page.waitForTimeout(1000);
      
      // フィルターを基本計算に変更
      await page.selectOption('select', 'basic');
      await page.waitForTimeout(1000);
      
      // 基本計算のみが表示されることを確認
      await expect(page.getByText('5 + 3 = 8')).toBeVisible();
      await expect(page.getByText('100 → 110 (税込)')).not.toBeVisible();
    });

    test('履歴のクリア', async ({ page }) => {
      // 計算を実行
      await page.getByText('2').click();
      await page.getByText('+').click();
      await page.getByText('3').click();
      await page.getByText('=').click();
      await page.waitForTimeout(1000);
      
      await expect(page.getByText('2 + 3 = 5')).toBeVisible();
      
      // 履歴をクリア
      await page.getByText('履歴クリア').click();
      await page.waitForTimeout(1000);
      
      // 履歴が削除されることを確認
      await expect(page.getByText('2 + 3 = 5')).not.toBeVisible();
    });
  });

  test.describe('レスポンシブデザイン', () => {
    test('モバイル画面での操作', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE size
      
      // ボタンがクリック可能であることを確認
      await page.getByText('1').click();
      await page.getByText('2').click();
      await page.getByText('3').click();
      
      await expect(page.getByDisplayValue('123')).toBeVisible();
      
      // 計算実行
      await page.getByText('+').click();
      await page.getByText('4').click();
      await page.getByText('5').click();
      await page.getByText('=').click();
      
      await expect(page.getByDisplayValue('168')).toBeVisible({ timeout: 5000 });
    });

    test('タブレット画面での操作', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 }); // iPad size
      
      await page.getByText('9').click();
      await page.getByText('9').click();
      await page.getByText('×').click();
      await page.getByText('9').click();
      await page.getByText('=').click();
      
      await expect(page.getByDisplayValue('891')).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('パフォーマンス', () => {
    test('連続計算でのパフォーマンス', async ({ page }) => {
      const startTime = Date.now();
      
      // 10回連続で計算を実行
      for (let i = 1; i <= 10; i++) {
        await page.getByText('AC').click();
        await page.getByText(i.toString()).click();
        await page.getByText('+').click();
        await page.getByText(i.toString()).click();
        await page.getByText('=').click();
        await page.waitForTimeout(200); // 各計算間の待機
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // 10回の計算が30秒以内に完了することを確認
      expect(duration).toBeLessThan(30000);
      
      // 最後の計算結果が正しいことを確認
      await expect(page.getByDisplayValue('20')).toBeVisible();
    });
  });
});