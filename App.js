import React from "react";
import { I18nextProvider } from "react-i18next";
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import AppNavigator from "./src/navigation/AppNavigator";
import { DataProvider } from "./src/context/DataContext";
import { LanguageProvider } from "./src/context/LanguageContext";
import i18n from "./src/locales/i18n";
import theme from "./src/theme/theme";
import { initializeNotifications } from "./src/services/notifications";
import { initializeCache } from "./src/services/cache";

export default function App() {
  React.useEffect(() => {
    // Initialize app services
    initializeNotifications();
    initializeCache();
  }, []);

  return (
    <SafeAreaProvider>
      <I18nextProvider i18n={i18n}>
        <LanguageProvider>
          <PaperProvider theme={theme}>
            <DataProvider>
              <StatusBar style="auto" />
              <AppNavigator />
            </DataProvider>
          </PaperProvider>
        </LanguageProvider>
      </I18nextProvider>
    </SafeAreaProvider>
  );
}
