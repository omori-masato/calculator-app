/**
 * 計算機状態管理フック
 */
import { useState, useCallback, useEffect } from 'react';
import { 
  CalculatorState, 
  CalculationType, 
  CalculationHistory 
} from '../types/index';
import { 
  CalculationService, 
  HistoryService, 
  TemporarySaveService 
} from '../services/calculationService';

export function useCalculator() {
  const [state, setState] = useState<CalculatorState>({
    displayValue: '0',
    currentExpression: '',
    lastResult: null,
    isResultDisplayed: false,
    temporarySave: { slot1: null, slot2: null },
  });

  const calculationService = CalculationService.getInstance();

  // 一時保存状態を読み込み
  useEffect(() => {
    const tempSave = TemporarySaveService.getTemporarySave();
    setState(prev => ({ ...prev, temporarySave: tempSave }));
  }, []);

  /**
   * ディスプレイ値を更新
   */
  const updateDisplay = useCallback((value: string) => {
    setState(prev => ({ ...prev, displayValue: value }));
  }, []);

  /**
   * 数字入力
   */
  const inputNumber = useCallback((num: string) => {
    setState(prev => {
      let newDisplayValue: string;
      let newExpression: string;
      let newIsResultDisplayed = false;

      if (prev.isResultDisplayed) {
        // 結果表示中の場合は新しい入力として扱う
        newDisplayValue = num;
        newExpression = num;
      } else if (prev.displayValue === '0' && num !== '.') {
        // 初期状態または0表示中の場合
        newDisplayValue = num;
        newExpression = prev.currentExpression ? prev.currentExpression + num : num;
      } else if (prev.displayValue === 'エラー') {
        // エラー状態からの回復
        newDisplayValue = num;
        newExpression = num;
      } else {
        // 通常の数字追加
        newDisplayValue = prev.displayValue + num;
        newExpression = prev.currentExpression + num;
      }

      return {
        ...prev,
        displayValue: newDisplayValue,
        currentExpression: newExpression,
        isResultDisplayed: newIsResultDisplayed,
      };
    });
  }, []);

  /**
   * 演算子入力
   */
  const inputOperator = useCallback((operator: string) => {
    setState(prev => {
      let newExpression: string;
      const displayOperator = operator === '*' ? '×' : operator === '/' ? '÷' : operator;

      if (prev.isResultDisplayed) {
        // 結果表示中の場合は結果を使って新しい式を開始
        newExpression = `${prev.displayValue} ${displayOperator} `;
      } else {
        // 通常の演算子追加
        newExpression = `${prev.currentExpression} ${displayOperator} `;
      }

      return {
        ...prev,
        displayValue: newExpression.trim(),
        currentExpression: newExpression,
        isResultDisplayed: false,
      };
    });
  }, []);

  /**
   * 基本計算実行
   */
  const calculateBasic = useCallback(() => {
    try {
      if (!state.currentExpression.trim()) {
        return;
      }

      if (!calculationService.validateExpression(state.currentExpression)) {
        throw new Error('無効な計算式です');
      }

      const result = calculationService.executeBasicCalculation(state.currentExpression);
      
      // 履歴に保存
      HistoryService.saveCalculation({
        expression: state.currentExpression,
        result,
        type: 'basic',
        timestamp: new Date(),
      });

      setState(prev => ({
        ...prev,
        displayValue: result.toString(),
        currentExpression: '',
        lastResult: result,
        isResultDisplayed: true,
      }));

    } catch (error) {
      setState(prev => ({
        ...prev,
        displayValue: 'エラー',
        isResultDisplayed: true,
        currentExpression: '',
      }));
    }
  }, [state.currentExpression, calculationService]);

  /**
   * 消費税計算実行
   */
  const calculateTax = useCallback((type: CalculationType) => {
    try {
      const currentValue = parseFloat(state.displayValue);
      if (isNaN(currentValue) || state.displayValue === 'エラー') {
        throw new Error('無効な数値です');
      }

      const result = calculationService.executeTaxCalculation(currentValue, type);
      
      // 履歴用の表現を作成
      const taxExpression = type === 'tax-inclusive' 
        ? `${currentValue} + 税10%` 
        : `${currentValue} - 税10%`;

      // 履歴に保存
      HistoryService.saveCalculation({
        expression: taxExpression,
        result,
        type,
        timestamp: new Date(),
      });

      setState(prev => ({
        ...prev,
        displayValue: result.toString(),
        currentExpression: '',
        lastResult: result,
        isResultDisplayed: true,
      }));

    } catch (error) {
      setState(prev => ({
        ...prev,
        displayValue: 'エラー',
        isResultDisplayed: true,
        currentExpression: '',
      }));
    }
  }, [state.displayValue, calculationService]);

  /**
   * ディスプレイクリア
   */
  const clearDisplay = useCallback(() => {
    setState(prev => ({
      ...prev,
      displayValue: '0',
      currentExpression: '',
      isResultDisplayed: false,
    }));
  }, []);

  /**
   * 最後の文字削除（バックスペース）
   */
  const deleteLastChar = useCallback(() => {
    setState(prev => {
      if (prev.displayValue.length > 1 && prev.displayValue !== '0' && prev.displayValue !== 'エラー') {
        return {
          ...prev,
          displayValue: prev.displayValue.slice(0, -1),
          currentExpression: prev.currentExpression.slice(0, -1),
        };
      } else {
        return {
          ...prev,
          displayValue: '0',
          currentExpression: '',
        };
      }
    });
  }, []);

  /**
   * 一時保存
   */
  const saveToSlot = useCallback((slot: 1 | 2) => {
    try {
      const currentValue = parseFloat(state.displayValue);
      if (isNaN(currentValue) || state.displayValue === 'エラー') {
        throw new Error('無効な数値です');
      }

      TemporarySaveService.saveToSlot(slot, currentValue);
      
      // 状態更新
      const newTempSave = TemporarySaveService.getTemporarySave();
      setState(prev => ({ ...prev, temporarySave: newTempSave }));

    } catch (error) {
      console.error('一時保存に失敗しました:', error);
    }
  }, [state.displayValue]);

  /**
   * 一時呼出し
   */
  const recallFromSlot = useCallback((slot: 1 | 2) => {
    const value = TemporarySaveService.recallFromSlot(slot);
    if (value !== null) {
      setState(prev => ({
        ...prev,
        displayValue: value.toString(),
        currentExpression: value.toString(),
        isResultDisplayed: true,
      }));
    }
  }, []);

  /**
   * 履歴から値を使用
   */
  const useHistoryResult = useCallback((result: number) => {
    setState(prev => ({
      ...prev,
      displayValue: result.toString(),
      currentExpression: result.toString(),
      isResultDisplayed: true,
    }));
  }, []);

  return {
    state,
    actions: {
      inputNumber,
      inputOperator,
      calculateBasic,
      calculateTax,
      clearDisplay,
      deleteLastChar,
      saveToSlot,
      recallFromSlot,
      useHistoryResult,
      updateDisplay,
    },
  };
}