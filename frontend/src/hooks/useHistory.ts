/**
 * 履歴管理フック
 */
import { useState, useEffect, useCallback } from 'react';
import { CalculationHistory, HistoryFilter } from '../types/index';
import { HistoryService } from '../services/calculationService';

export function useHistory() {
  const [history, setHistory] = useState<CalculationHistory[]>([]);
  const [currentFilter, setCurrentFilter] = useState<HistoryFilter>('all');
  const [filteredHistory, setFilteredHistory] = useState<CalculationHistory[]>([]);

  // 履歴データを更新
  const updateHistory = useCallback(() => {
    const allHistory = HistoryService.getHistory();
    setHistory(allHistory);
    
    // フィルタリングを適用
    const filtered = HistoryService.getFilteredHistory(currentFilter);
    setFilteredHistory(filtered);
  }, [currentFilter]);

  // 初期読み込みと定期更新
  useEffect(() => {
    // サンプルデータ初期化
    HistoryService.initializeSampleHistory();
    
    // 履歴を読み込み
    updateHistory();

    // 定期的に履歴を更新（他のタブでの変更を検出）
    const interval = setInterval(() => {
      updateHistory();
    }, 1000);

    return () => clearInterval(interval);
  }, [updateHistory]);

  // フィルタ変更時の処理
  useEffect(() => {
    const filtered = HistoryService.getFilteredHistory(currentFilter);
    setFilteredHistory(filtered);
  }, [currentFilter, history]);

  /**
   * フィルタを変更
   */
  const changeFilter = useCallback((filter: HistoryFilter) => {
    setCurrentFilter(filter);
  }, []);

  /**
   * 全履歴を削除
   */
  const clearAllHistory = useCallback(() => {
    HistoryService.clearAllHistory();
    updateHistory();
  }, [updateHistory]);

  /**
   * 手動で履歴を更新（計算実行後などに呼び出し）
   */
  const refreshHistory = useCallback(() => {
    updateHistory();
  }, [updateHistory]);

  return {
    history: filteredHistory,
    currentFilter,
    actions: {
      changeFilter,
      clearAllHistory,
      refreshHistory,
    },
  };
}