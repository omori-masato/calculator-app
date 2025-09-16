/**
 * メインアプリケーションコンポーネント
 */
import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { UnifiedCalculator } from './components/UnifiedCalculator';

// Material-UIテーマの設定
const theme = createTheme({
  palette: {
    primary: {
      main: '#667eea',
      light: '#99a7f0',
      dark: '#4a5bb8',
    },
    secondary: {
      main: '#764ba2',
      light: '#a478d1',
      dark: '#563771',
    },
    error: {
      main: '#f44336',
    },
    warning: {
      main: '#ff9800',
    },
    info: {
      main: '#2196f3',
    },
    success: {
      main: '#4caf50',
    },
  },
  typography: {
    fontFamily: [
      'Roboto',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
  },
  components: {
    // Material-UIコンポーネントのカスタマイズ
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', // ボタンテキストの大文字変換を無効化
          fontWeight: 500,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none', // デフォルトの背景グラデーションを削除
        },
      },
    },
  },
});

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <UnifiedCalculator />
    </ThemeProvider>
  );
};

export default App;