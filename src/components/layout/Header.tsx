import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform, StatusBar } from 'react-native';
import { useApp } from '../../context/AppContext';
import { colors } from '../../theme/colors';
import { Role } from '../../types';
import { Building2, User, Wrench, Crown } from 'lucide-react-native';

export const Header: React.FC = () => {
  const { role, setRole, ownerSettings } = useApp();

  const roleConfigs: { [key in Role]: { label: string; icon: any; color: string; bg: string } } = {
    tenant: { label: 'Tenant', icon: User, color: colors.textPrimary, bg: colors.surfaceSubtle },
    manager: { label: 'Manager', icon: Wrench, color: colors.info, bg: colors.infoLight },
    malik: { label: 'Malik (Owner)', icon: Crown, color: colors.warning, bg: colors.warningLight },
  };

  const currentRoleConfig = roleConfigs[role];
  const IconComponent = currentRoleConfig.icon;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* PG Info */}
        <View style={styles.leftSection}>
          <View style={styles.logoBadge}>
            <Building2 size={18} color={colors.textPrimary} />
          </View>
          <View>
            <Text style={styles.pgName}>{ownerSettings.pgName}</Text>
            <Text style={styles.pgSub}>Simple PG Manager</Text>
          </View>
        </View>

        {/* Quick Role Switcher Pill */}
        <View style={styles.roleSelector}>
          {(['tenant', 'manager', 'malik'] as Role[]).map((r) => {
            const isActive = role === r;
            return (
              <TouchableOpacity
                key={r}
                onPress={() => setRole(r)}
                style={[styles.roleButton, isActive && styles.roleButtonActive]}
                activeOpacity={0.7}
              >
                <Text style={[styles.roleButtonText, isActive && styles.roleButtonTextActive]}>
                  {r === 'tenant' ? 'Tenant' : r === 'manager' ? 'Manager' : 'Malik'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.surface,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pgName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },
  pgSub: {
    fontSize: 11,
    color: colors.textMuted,
  },
  roleSelector: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: 8,
    padding: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  roleButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  roleButtonActive: {
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  roleButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  roleButtonTextActive: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
});
