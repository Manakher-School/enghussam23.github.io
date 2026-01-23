import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import DataProvider from './context/DataContext';
import { GradeProvider } from './context/GradeContext';
import GradeSelectionDialog from './components/GradeSelectionDialog';
import MainLayout from './components/MainLayout';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2196F3',
    },
    secondary: {
      main: '#03DAC6',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Cairo", sans-serif',
  },
  direction: 'rtl',
});

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <GradeProvider>
          <DataProvider>
            <GradeSelectionDialog />
            <MainLayout />
          </DataProvider>
        </GradeProvider>
      </ThemeProvider>
    </I18nextProvider>
  );
}

export default App;
