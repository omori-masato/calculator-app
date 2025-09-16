/**
 * 消費税計算ボタンコンポーネント
 */
import React from 'react';
import { Box, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import { CalculationType } from '../types/index';

const TaxContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1.25),
}));

const TaxButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== 'taxType',
})<{ taxType: 'inclusive' | 'exclusive' }>(({ theme, taxType }) => ({
  flex: 1,
  padding: theme.spacing(1.75),
  fontSize: '14px',
  fontWeight: 500,
  borderRadius: '10px',
  textTransform: 'none',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.2s ease',
  backgroundColor: taxType === 'inclusive' ? '#9c27b0' : '#673ab7',
  color: 'white',
  '&:hover': {
    backgroundColor: taxType === 'inclusive' ? '#7b1fa2' : '#512da8',
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
  },
  '&:active': {
    transform: 'translateY(0)',
  },
}));

interface TaxCalculationButtonsProps {
  onTaxCalculation: (type: CalculationType) => void;
}

export const TaxCalculationButtons: React.FC<TaxCalculationButtonsProps> = ({
  onTaxCalculation,
}) => {
  return (
    <TaxContainer>
      <TaxButton
        variant="contained"
        taxType="inclusive"
        onClick={() => onTaxCalculation('tax-inclusive')}
      >
        税込 (+10%)
      </TaxButton>
      <TaxButton
        variant="contained"
        taxType="exclusive"
        onClick={() => onTaxCalculation('tax-exclusive')}
      >
        税抜 (-10%)
      </TaxButton>
    </TaxContainer>
  );
};