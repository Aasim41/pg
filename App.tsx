import React, { useState, useEffect } from 'react';
import { View, StyleSheet, StatusBar as RNStatusBar } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { AppProvider, useApp } from './src/context/AppContext';
import { Header } from './src/components/layout/Header';
import { TabBar } from './src/components/layout/TabBar';
import { LoginScreen } from './src/screens/auth/LoginScreen';

// Tenant Screens
import { MeraKirayaScreen } from './src/screens/tenant/MeraKirayaScreen';
import { BijliBillScreen } from './src/screens/tenant/BijliBillScreen';
import { ComplaintScreen } from './src/screens/tenant/ComplaintScreen';
import { KhaanaMenuScreen } from './src/screens/tenant/KhaanaMenuScreen';

// Manager Screens
import { MeterReadingScreen } from './src/screens/manager/MeterReadingScreen';
import { ComplaintListScreen } from './src/screens/manager/ComplaintListScreen';
import { NayaTenantScreen } from './src/screens/manager/NayaTenantScreen';

// Malik Screens
import { KirayaHisaabScreen } from './src/screens/malik/KirayaHisaabScreen';
import { KhaaliBedScreen } from './src/screens/malik/KhaaliBedScreen';
import { MalikOperationsScreen } from './src/screens/malik/MalikOperationsScreen';
import { colors } from './src/theme/colors';

const MainNavigator: React.FC = () => {
  const { role, isLoggedIn } = useApp();
  const [currentTab, setCurrentTab] = useState('kiraya');

  // Reset default tab when role switches
  useEffect(() => {
    if (role === 'tenant') setCurrentTab('kiraya');
    else if (role === 'manager') setCurrentTab('meter');
    else if (role === 'malik') setCurrentTab('hisaab');
  }, [role]);

  if (!isLoggedIn) {
    return <LoginScreen />;
  }

  const renderScreen = () => {
    if (role === 'tenant') {
      switch (currentTab) {
        case 'kiraya':
          return <MeraKirayaScreen />;
        case 'bijli':
          return <BijliBillScreen />;
        case 'complaints':
          return <ComplaintScreen />;
        case 'khaana':
          return <KhaanaMenuScreen />;
        default:
          return <MeraKirayaScreen />;
      }
    }

    if (role === 'manager') {
      switch (currentTab) {
        case 'meter':
          return <MeterReadingScreen />;
        case 'complaints':
          return <ComplaintListScreen />;
        case 'onboard':
          return <NayaTenantScreen />;
        default:
          return <MeterReadingScreen />;
      }
    }

    if (role === 'malik') {
      switch (currentTab) {
        case 'hisaab':
          return <KirayaHisaabScreen />;
        case 'beds':
          return <KhaaliBedScreen />;
        case 'ops':
          return <MalikOperationsScreen />;
        default:
          return <KirayaHisaabScreen />;
      }
    }

    return null;
  };

  return (
    <View style={styles.appContainer}>
      <StatusBar style="dark" />
      <Header />
      <View style={styles.screenContainer}>{renderScreen()}</View>
      <TabBar currentTab={currentTab} onSelectTab={setCurrentTab} />
    </View>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainNavigator />
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screenContainer: {
    flex: 1,
  },
});
