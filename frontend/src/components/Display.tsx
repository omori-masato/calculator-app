/**
 * 計算機ディスプレイコンポーネント
 */
import React from 'react';
import { Paper, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

const DisplayContainer = styled(Paper)(({ theme }) => ({
  backgroundColor: '#f8f9fa',
  borderRadius: '12px',
  padding: theme.spacing(2.5),
  marginBottom: theme.spacing(2.5),
  minHeight: '80px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  border: '2px solid #e0e0e0',
  overflow: 'hidden',
}));

const DisplayText = styled(Typography)(({ theme }) => ({
  fontSize: '28px',
  fontWeight: 500,
  color: '#333',
  wordBreak: 'break-all',
  textAlign: 'right',
  lineHeight: 1.2,
  [theme.breakpoints.down('sm')]: {
    fontSize: '24px',
  },
}));

interface DisplayProps {
  value: string;
}

export const Display: React.FC<DisplayProps> = ({ value }) => {
  return (
    <DisplayContainer elevation={0}>
      <DisplayText variant="h4">
        {value}
      </DisplayText>
    </DisplayContainer>
  );
};