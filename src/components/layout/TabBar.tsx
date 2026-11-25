import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useApp } from '../../context/AppContext';
import { colors } from '../../theme/colors';
import {
  CreditCard,
  Zap,
  MessageSquareWarning,
  UtensilsCrossed,
  Gauge,
  UserPlus,
  TrendingUp,
  LayoutGrid,
  SlidersHorizontal,
} from 'lucide-react-native';

interface TabBarProps {
  currentTab: string;
  onSelectTab: (tabId: string) => void;
}

export const TabBar: React.FC<TabBarProps> = ({ currentTab, onSelectTab }) => {
  const { role } = useApp();

  const tenantTabs = [
    { id: 'kiraya', label: 'Mera Kiraya', icon: CreditCard },
    { id: 'bijli', label: 'Bijli Bill', icon: Zap },
    { id: 'complaints', label: 'Complaints', icon: MessageSquareWarning },
    { id: 'khaana', label: 'Food Menu', icon: UtensilsCrossed },
  ];

  const managerTabs = [
    { id: 'meter', label: 'Meter Reading', icon: Gauge },
    { id: 'complaints', label: 'Complaints', icon: MessageSquareWarning },
    { id: 'onboard', label: 'Naya Tenant', icon: UserPlus },
  ];

  const malikTabs = [
    { id: 'hisaab', label: 'Kiraya Hisaab', icon: TrendingUp },
    { id: 'beds', label: 'Khaali Beds', icon: LayoutGrid },
    { id: 'ops', label: 'All Operations', icon: SlidersHorizontal },
  ];

  const tabs = role === 'tenant' ? tenantTabs : role === 'manager' ? managerTabs : malikTabs;

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = currentTab === tab.id;
        const Icon = tab.icon;
        return (
          <TouchableOpacity
            key={tab.id}
            style={styles.tabItem}
            onPress={() => onSelectTab(tab.id)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconWrapper, isActive && styles.iconWrapperActive]}>
              <Icon
                size={20}
                color={isActive ? colors.primary : colors.textMuted}
                strokeWidth={isActive ? 2.3 : 1.8}
              />
            </View>
            <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingVertical: 8,
    paddingBottom: 20,
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 3,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapperActive: {
    backgroundColor: colors.surfaceSubtle,
  },
  tabLabel: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
    fontWeight: '500',
  },
  tabLabelActive: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
});
