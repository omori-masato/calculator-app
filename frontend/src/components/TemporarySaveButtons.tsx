/**
 * 一時保存ボタンコンポーネント
 */
import React from 'react';
import { Box, Button, Typography, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import { TemporarySave } from '../types/index';

const SaveContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1.5),
  marginBottom: theme.spacing(2.5),
}));

const SaveSlot = styled(Paper, {
  shouldForwardProp: (prop) => prop !== 'hasValue',
})<{ hasValue: boolean }>(({ theme, hasValue }) => ({
  flex: 1,
  backgroundColor: hasValue ? '#e8f5e8' : '#f0f4ff',
  borderRadius: '8px',
  padding: theme.spacing(1.5),
  border: hasValue ? '2px solid #c8e6c9' : '2px solid #e3f2fd',
  textAlign: 'center',
}));

const ValueText = styled(Typography)(({ theme }) => ({
  fontSize: '14px',
  fontWeight: 500,
  color: '#666',
  marginBottom: theme.spacing(0.75),
}));

const ButtonContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(0.75),
}));

const SaveButton = styled(Button)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(0.75),
  fontSize: '12px',
  fontWeight: 500,
  textTransform: 'none',
  minWidth: 'unset',
}));

interface TemporarySaveButtonsProps {
  temporarySave: TemporarySave;
  onSave: (slot: 1 | 2) => void;
  onRecall: (slot: 1 | 2) => void;
}

export const TemporarySaveButtons: React.FC<TemporarySaveButtonsProps> = ({
  temporarySave,
  onSave,
  onRecall,
}) => {
  const renderSlot = (slotNumber: 1 | 2) => {
    const value = temporarySave[`slot${slotNumber}`];
    const hasValue = value !== null;

    return (
      <SaveSlot key={slotNumber} elevation={0} hasValue={hasValue}>
        <ValueText>
          {hasValue ? value.toLocaleString() : '空'}
        </ValueText>
        <ButtonContainer>
          <SaveButton
            variant="contained"
            color="primary"
            onClick={() => onSave(slotNumber)}
            size="small"
          >
            Save{slotNumber}
          </SaveButton>
          <SaveButton
            variant="contained"
            color="success"
            onClick={() => onRecall(slotNumber)}
            disabled={!hasValue}
            size="small"
          >
            Recall{slotNumber}
          </SaveButton>
        </ButtonContainer>
      </SaveSlot>
    );
  };

  return (
    <SaveContainer>
      {renderSlot(1)}
      {renderSlot(2)}
    </SaveContainer>
  );
};