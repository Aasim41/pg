import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/colors';
import { MeterReadingScreen } from '../manager/MeterReadingScreen';
import { ComplaintListScreen } from '../manager/ComplaintListScreen';
import { NayaTenantScreen } from '../manager/NayaTenantScreen';
import { Gauge, MessageSquareWarning, UserPlus } from 'lucide-react-native';

export const MalikOperationsScreen: React.FC = () => {
  const [subTab, setSubTab] = useState<'meter' | 'complaints' | 'onboard'>('meter');

  return (
    <View style={styles.container}>
      {/* Sub-navigation bar */}
      <View style={styles.subBar}>
        <TouchableOpacity
          style={[styles.subBtn, subTab === 'meter' && styles.subBtnActive]}
          onPress={() => setSubTab('meter')}
        >
          <Gauge size={14} color={subTab === 'meter' ? colors.textPrimary : colors.textMuted} />
          <Text style={[styles.subBtnText, subTab === 'meter' && styles.subBtnTextActive]}>
            Meter Entry
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.subBtn, subTab === 'complaints' && styles.subBtnActive]}
          onPress={() => setSubTab('complaints')}
        >
          <MessageSquareWarning size={14} color={subTab === 'complaints' ? colors.textPrimary : colors.textMuted} />
          <Text style={[styles.subBtnText, subTab === 'complaints' && styles.subBtnTextActive]}>
            Complaints
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.subBtn, subTab === 'onboard' && styles.subBtnActive]}
          onPress={() => setSubTab('onboard')}
        >
          <UserPlus size={14} color={subTab === 'onboard' ? colors.textPrimary : colors.textMuted} />
          <Text style={[styles.subBtnText, subTab === 'onboard' && styles.subBtnTextActive]}>
            + Add Tenant
          </Text>
        </TouchableOpacity>
      </View>

      {/* Render selected operational view */}
      <View style={styles.viewContainer}>
        {subTab === 'meter' && <MeterReadingScreen />}
        {subTab === 'complaints' && <ComplaintListScreen />}
        {subTab === 'onboard' && <NayaTenantScreen />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  subBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 8,
  },
  subBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
  },
  subBtnActive: {
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
  },
  subBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  subBtnTextActive: {
    color: colors.textPrimary,
    fontWeight: '800',
  },
  viewContainer: {
    flex: 1,
  },
});
