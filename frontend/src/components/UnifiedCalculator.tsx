/**
 * 統合計算ページコンポーネント
 * 計算機能と履歴表示を統合した画面
 */
import React, { useEffect, useCallback } from 'react';
import { Box, Typography, AppBar, Toolbar } from '@mui/material';
import { styled } from '@mui/material/styles';
import { CalculationType, HistoryFilter } from '../types/index';
import { useCalculator } from '../hooks/useCalculator';
import { useHistory } from '../hooks/useHistory';
import { CalculatorPanel } from './CalculatorPanel';
import { HistoryPanel } from './HistoryPanel';

const AppContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  display: 'flex',
  flexDirection: 'column',
}));

const HeaderBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  color: '#333',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
}));

const AppTitle = styled(Typography)(({ theme }) => ({
  fontSize: '24px',
  fontWeight: 500,
  textAlign: 'center',
  flex: 1,
}));

const MainContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  gap: theme.spacing(2.5),
  padding: theme.spacing(2.5),
  maxWidth: '1200px',
  margin: '0 auto',
  width: '100%',
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    gap: theme.spacing(2),
  },
}));

const CalculatorSection = styled(Box)(({ theme }) => ({
  flex: '0 0 60%',
  display: 'flex',
  justifyContent: 'center',
  [theme.breakpoints.down('md')]: {
    flex: 'none',
  },
}));

const HistorySection = styled(Box)(({ theme }) => ({
  flex: '0 0 40%',
  display: 'flex',
  flexDirection: 'column',
  [theme.breakpoints.down('md')]: {
    flex: 'none',
    maxHeight: '400px',
  },
}));

export const UnifiedCalculator: React.FC = () => {
  const { state, actions } = useCalculator();
  const { history, currentFilter, actions: historyActions } = useHistory();

  // キーボード入力対応
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    event.preventDefault();
    
    const key = event.key;
    
    if (key >= '0' && key <= '9') {
      actions.inputNumber(key);
    } else if (key === '.') {
      actions.inputNumber('.');
    } else if (key === '+') {
      actions.inputOperator('+');
    } else if (key === '-') {
      actions.inputOperator('-');
    } else if (key === '*') {
      actions.inputOperator('*');
    } else if (key === '/') {
      actions.inputOperator('/');
    } else if (key === 'Enter' || key === '=') {
      actions.calculateBasic();
    } else if (key === 'Escape' || key === 'c' || key === 'C') {
      actions.clearDisplay();
    } else if (key === 'Backspace') {
      actions.deleteLastChar();
    }
  }, [actions]);

  // キーボードイベントリスナーの設定
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // 計算実行後の履歴更新
  const handleCalculateBasic = useCallback(() => {
    actions.calculateBasic();
    // 少し遅らせて履歴を更新（状態変更の反映を待つ）
    setTimeout(() => {
      historyActions.refreshHistory();
    }, 100);
  }, [actions, historyActions]);

  // 税計算実行後の履歴更新
  const handleTaxCalculation = useCallback((type: CalculationType) => {
    actions.calculateTax(type);
    // 少し遅らせて履歴を更新（状態変更の反映を待つ）
    setTimeout(() => {
      historyActions.refreshHistory();
    }, 100);
  }, [actions, historyActions]);

  // 履歴の全削除（確認ダイアログ付き）
  const handleClearAllHistory = useCallback(() => {
    if (window.confirm('すべての計算履歴を削除しますか？')) {
      historyActions.clearAllHistory();
    }
  }, [historyActions]);

  return (
    <AppContainer>
      {/* ヘッダー */}
      <HeaderBar position="static" elevation={0}>
        <Toolbar>
          <AppTitle>
            電卓アプリ - 統合画面
          </AppTitle>
        </Toolbar>
      </HeaderBar>

      {/* メインコンテンツ */}
      <MainContainer>
        {/* 計算機セクション */}
        <CalculatorSection>
          <CalculatorPanel
            state={state}
            onNumberInput={actions.inputNumber}
            onOperatorInput={actions.inputOperator}
            onCalculate={handleCalculateBasic}
            onClear={actions.clearDisplay}
            onDelete={actions.deleteLastChar}
            onTaxCalculation={handleTaxCalculation}
            onSaveToSlot={actions.saveToSlot}
            onRecallFromSlot={actions.recallFromSlot}
          />
        </CalculatorSection>

        {/* 履歴セクション */}
        <HistorySection>
          <HistoryPanel
            history={history}
            currentFilter={currentFilter}
            onFilterChange={historyActions.changeFilter}
            onClearAll={handleClearAllHistory}
            onUseResult={actions.useHistoryResult}
          />
        </HistorySection>
      </MainContainer>
    </AppContainer>
  );
};