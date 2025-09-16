/**
 * 履歴パネルコンポーネント
 */
import React from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Chip,
  IconButton,
} from '@mui/material';
import { Delete as DeleteIcon, History as HistoryIcon } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { CalculationHistory, HistoryFilter } from '../types/index';
import { getRelativeTime } from '../utils/dateUtils';

const HistoryContainer = styled(Paper)(({ theme }) => ({
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  borderRadius: '20px',
  padding: theme.spacing(2.5),
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
}));

const HistoryHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
  paddingBottom: theme.spacing(1.5),
  borderBottom: '2px solid #f0f0f0',
}));

const HistoryTitle = styled(Typography)(({ theme }) => ({
  fontSize: '20px',
  fontWeight: 500,
  color: '#333',
}));

const FilterSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(0.75),
  marginBottom: theme.spacing(1.5),
  flexWrap: 'wrap',
}));

const FilterChip = styled(Chip)(({ theme }) => ({
  fontSize: '11px',
  height: '24px',
  '& .MuiChip-label': {
    padding: theme.spacing(0, 1),
  },
}));

const HistoryList = styled(Box)(({ theme }) => ({
  flex: 1,
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
  maxHeight: '500px',
  '&::-webkit-scrollbar': {
    width: '6px',
  },
  '&::-webkit-scrollbar-track': {
    background: '#f1f1f1',
    borderRadius: '3px',
  },
  '&::-webkit-scrollbar-thumb': {
    background: '#c1c1c1',
    borderRadius: '3px',
    '&:hover': {
      background: '#a8a8a8',
    },
  },
}));

const HistoryItem = styled(Paper, {
  shouldForwardProp: (prop) => prop !== 'calculationType',
})<{ calculationType: string }>(({ theme, calculationType }) => {
  const getBorderColor = () => {
    switch (calculationType) {
      case 'basic': return '#4caf50';
      case 'tax-inclusive': return '#9c27b0';
      case 'tax-exclusive': return '#673ab7';
      default: return '#e0e0e0';
    }
  };

  return {
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    padding: theme.spacing(1.5),
    border: '2px solid #e0e0e0',
    borderLeft: `4px solid ${getBorderColor()}`,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    position: 'relative',
    '&:hover': {
      transform: 'translateY(-1px)',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      borderColor: '#667eea',
      '& .use-hint': {
        opacity: 1,
      },
    },
  };
});

const UseHint = styled(Typography)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(0.75),
  right: theme.spacing(1),
  fontSize: '10px',
  color: '#667eea',
  opacity: 0,
  transition: 'opacity 0.2s ease',
}));

const HistoryExpression = styled(Typography)(({ theme }) => ({
  fontSize: '13px',
  color: '#555',
  marginBottom: theme.spacing(0.5),
  fontFamily: '"Courier New", monospace',
}));

const HistoryResult = styled(Typography)(({ theme }) => ({
  fontSize: '18px',
  fontWeight: 500,
  color: '#333',
  marginBottom: theme.spacing(0.5),
}));

const HistoryMeta = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  fontSize: '10px',
}));

const TypeChip = styled(Chip, {
  shouldForwardProp: (prop) => prop !== 'calculationType',
})<{ calculationType: string }>(({ theme, calculationType }) => {
  const getChipStyles = () => {
    switch (calculationType) {
      case 'basic':
        return {
          backgroundColor: '#e8f5e8',
          color: '#4caf50',
        };
      case 'tax-inclusive':
        return {
          backgroundColor: '#f3e5f5',
          color: '#9c27b0',
        };
      case 'tax-exclusive':
        return {
          backgroundColor: '#ede7f6',
          color: '#673ab7',
        };
      default:
        return {
          backgroundColor: '#f5f5f5',
          color: '#666',
        };
    }
  };

  return {
    fontSize: '9px',
    height: '18px',
    fontWeight: 500,
    textTransform: 'uppercase',
    '& .MuiChip-label': {
      padding: theme.spacing(0, 0.75),
    },
    ...getChipStyles(),
  };
});

const TimeText = styled(Typography)(({ theme }) => ({
  fontSize: '10px',
  color: '#aaa',
}));

const EmptyState = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(3.75, 2.5),
  color: '#888',
}));

const EmptyIcon = styled(HistoryIcon)(({ theme }) => ({
  fontSize: '36px',
  color: '#ddd',
  marginBottom: theme.spacing(1.5),
}));

interface HistoryPanelProps {
  history: CalculationHistory[];
  currentFilter: HistoryFilter;
  onFilterChange: (filter: HistoryFilter) => void;
  onClearAll: () => void;
  onUseResult: (result: number) => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({
  history,
  currentFilter,
  onFilterChange,
  onClearAll,
  onUseResult,
}) => {
  const filters: { value: HistoryFilter; label: string }[] = [
    { value: 'all', label: 'すべて' },
    { value: 'basic', label: '基本' },
    { value: 'tax-inclusive', label: '税込' },
    { value: 'tax-exclusive', label: '税抜' },
  ];

  const getTypeLabel = (type: string): string => {
    switch (type) {
      case 'basic': return '基本';
      case 'tax-inclusive': return '税込';
      case 'tax-exclusive': return '税抜';
      default: return type;
    }
  };

  return (
    <HistoryContainer elevation={3}>
      <HistoryHeader>
        <HistoryTitle>計算履歴</HistoryTitle>
        <IconButton
          color="error"
          size="small"
          onClick={onClearAll}
          title="全削除"
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </HistoryHeader>

      {/* フィルター */}
      <FilterSection>
        {filters.map((filter) => (
          <FilterChip
            key={filter.value}
            label={filter.label}
            variant={currentFilter === filter.value ? 'filled' : 'outlined'}
            color={currentFilter === filter.value ? 'primary' : 'default'}
            onClick={() => onFilterChange(filter.value)}
            size="small"
          />
        ))}
      </FilterSection>

      {/* 履歴リスト */}
      <HistoryList>
        {history.length === 0 ? (
          <EmptyState>
            <EmptyIcon />
            <Typography>履歴なし</Typography>
          </EmptyState>
        ) : (
          history.map((item) => (
            <HistoryItem
              key={item.id}
              elevation={0}
              calculationType={item.type}
              onClick={() => onUseResult(item.result)}
            >
              <UseHint className="use-hint">クリック</UseHint>
              
              <HistoryExpression>
                {item.expression}
              </HistoryExpression>
              
              <HistoryResult>
                {item.result.toLocaleString()}
              </HistoryResult>
              
              <HistoryMeta>
                <TypeChip
                  label={getTypeLabel(item.type)}
                  size="small"
                  calculationType={item.type}
                />
                <TimeText>
                  {getRelativeTime(item.timestamp)}
                </TimeText>
              </HistoryMeta>
            </HistoryItem>
          ))
        )}
      </HistoryList>
    </HistoryContainer>
  );
};