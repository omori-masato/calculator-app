/**
 * 数字・演算子ボタンパッドコンポーネント
 */
import React from 'react';
import { Button, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';

const ButtonGrid = styled(Grid)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  gap: theme.spacing(1.25),
  '& .MuiGrid-item': {
    padding: 0,
  },
}));

const CalculatorButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== 'buttonType',
})<{ buttonType?: 'number' | 'operator' | 'equals' | 'clear' }>(({ theme, buttonType }) => {
  const getButtonStyles = () => {
    switch (buttonType) {
      case 'number':
        return {
          backgroundColor: '#f5f5f5',
          color: '#333',
          '&:hover': {
            backgroundColor: '#e0e0e0',
          },
        };
      case 'operator':
        return {
          backgroundColor: '#ff9800',
          color: 'white',
          '&:hover': {
            backgroundColor: '#f57c00',
          },
        };
      case 'equals':
        return {
          backgroundColor: '#4caf50',
          color: 'white',
          '&:hover': {
            backgroundColor: '#388e3c',
          },
        };
      case 'clear':
        return {
          backgroundColor: '#f44336',
          color: 'white',
          '&:hover': {
            backgroundColor: '#d32f2f',
          },
        };
      default:
        return {
          backgroundColor: '#f5f5f5',
          color: '#333',
        };
    }
  };

  return {
    padding: theme.spacing(2),
    fontSize: '18px',
    fontWeight: 500,
    borderRadius: '10px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.2s ease',
    textTransform: 'none',
    minWidth: 'unset',
    height: '60px',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
    },
    '&:active': {
      transform: 'translateY(0)',
    },
    ...getButtonStyles(),
  };
});

interface NumberPadProps {
  onNumberClick: (number: string) => void;
  onOperatorClick: (operator: string) => void;
  onEqualsClick: () => void;
  onClearClick: () => void;
  onDeleteClick: () => void;
}

export const NumberPad: React.FC<NumberPadProps> = ({
  onNumberClick,
  onOperatorClick,
  onEqualsClick,
  onClearClick,
  onDeleteClick,
}) => {
  const buttons = [
    // 第1行
    { label: 'C', type: 'clear' as const, action: onClearClick, gridSize: 3 },
    { label: '⌫', type: 'operator' as const, action: onDeleteClick, gridSize: 3 },
    
    // 第2行
    { label: '7', type: 'number' as const, action: () => onNumberClick('7'), gridSize: 3 },
    { label: '8', type: 'number' as const, action: () => onNumberClick('8'), gridSize: 3 },
    { label: '9', type: 'number' as const, action: () => onNumberClick('9'), gridSize: 3 },
    { label: '÷', type: 'operator' as const, action: () => onOperatorClick('/'), gridSize: 3 },
    
    // 第3行
    { label: '4', type: 'number' as const, action: () => onNumberClick('4'), gridSize: 3 },
    { label: '5', type: 'number' as const, action: () => onNumberClick('5'), gridSize: 3 },
    { label: '6', type: 'number' as const, action: () => onNumberClick('6'), gridSize: 3 },
    { label: '×', type: 'operator' as const, action: () => onOperatorClick('*'), gridSize: 3 },
    
    // 第4行
    { label: '1', type: 'number' as const, action: () => onNumberClick('1'), gridSize: 3 },
    { label: '2', type: 'number' as const, action: () => onNumberClick('2'), gridSize: 3 },
    { label: '3', type: 'number' as const, action: () => onNumberClick('3'), gridSize: 3 },
    { label: '-', type: 'operator' as const, action: () => onOperatorClick('-'), gridSize: 3 },
    
    // 第5行
    { label: '0', type: 'number' as const, action: () => onNumberClick('0'), gridSize: 6 },
    { label: '.', type: 'number' as const, action: () => onNumberClick('.'), gridSize: 3 },
    { label: '+', type: 'operator' as const, action: () => onOperatorClick('+'), gridSize: 3 },
    
    // 第6行（等号ボタンは別途配置）
  ];

  return (
    <ButtonGrid container spacing={0}>
      {/* 通常のボタン */}
      {buttons.map((button, index) => (
        <Grid item xs={button.gridSize} key={index}>
          <CalculatorButton
            variant="contained"
            fullWidth
            buttonType={button.type}
            onClick={button.action}
          >
            {button.label}
          </CalculatorButton>
        </Grid>
      ))}
      
      {/* 等号ボタン（右下） */}
      <Grid item xs={12}>
        <CalculatorButton
          variant="contained"
          fullWidth
          buttonType="equals"
          onClick={onEqualsClick}
        >
          =
        </CalculatorButton>
      </Grid>
    </ButtonGrid>
  );
};