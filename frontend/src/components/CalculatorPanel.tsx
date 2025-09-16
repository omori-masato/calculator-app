/**
 * 計算機パネルコンポーネント
 */
import React from 'react';
import { Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import { CalculatorState, CalculationType } from '../types/index';
import { Display } from './Display';
import { TemporarySaveButtons } from './TemporarySaveButtons';
import { NumberPad } from './NumberPad';
import { TaxCalculationButtons } from './TaxCalculationButtons';

const CalculatorContainer = styled(Paper)(({ theme }) => ({
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  borderRadius: '20px',
  padding: theme.spacing(3),
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
  width: '100%',
  maxWidth: '400px',
  margin: '0 auto',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
    maxWidth: '100%',
  },
}));

interface CalculatorPanelProps {
  state: CalculatorState;
  onNumberInput: (number: string) => void;
  onOperatorInput: (operator: string) => void;
  onCalculate: () => void;
  onClear: () => void;
  onDelete: () => void;
  onTaxCalculation: (type: CalculationType) => void;
  onSaveToSlot: (slot: 1 | 2) => void;
  onRecallFromSlot: (slot: 1 | 2) => void;
}

export const CalculatorPanel: React.FC<CalculatorPanelProps> = ({
  state,
  onNumberInput,
  onOperatorInput,
  onCalculate,
  onClear,
  onDelete,
  onTaxCalculation,
  onSaveToSlot,
  onRecallFromSlot,
}) => {
  return (
    <CalculatorContainer elevation={3}>
      {/* ディスプレイ */}
      <Display value={state.displayValue} />

      {/* 一時保存 */}
      <TemporarySaveButtons
        temporarySave={state.temporarySave}
        onSave={onSaveToSlot}
        onRecall={onRecallFromSlot}
      />

      {/* 数字・演算子ボタン */}
      <NumberPad
        onNumberClick={onNumberInput}
        onOperatorClick={onOperatorInput}
        onEqualsClick={onCalculate}
        onClearClick={onClear}
        onDeleteClick={onDelete}
      />

      {/* 税計算ボタン */}
      <TaxCalculationButtons onTaxCalculation={onTaxCalculation} />
    </CalculatorContainer>
  );
};