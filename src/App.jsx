import React, { useState, useEffect } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import { createAppTheme } from './theme/theme';
import { AuthProvider } from './context/AuthContext';
import DataProvider from './context/DataContext';
import { GradeProvider } from './context/GradeContext';
import GradeSelectionDialog from './components/GradeSelectionDialog';
import MainLayout from './components/MainLayout';

function App() {
  const [theme, setTheme] = useState(createAppTheme(i18n.language === 'ar' ? 'rtl' : 'ltr'));

  useEffect(() => {
    const handleLanguageChange = () => {
      setTheme(createAppTheme(i18n.language === 'ar' ? 'rtl' : 'ltr'));
    };

    i18n.on('languageChanged', handleLanguageChange);
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, []);

  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <GradeProvider>
            <DataProvider>
              <GradeSelectionDialog />
              <MainLayout />
            </DataProvider>
          </GradeProvider>
        </AuthProvider>
      </ThemeProvider>
    </I18nextProvider>
  );
}

export default App;
