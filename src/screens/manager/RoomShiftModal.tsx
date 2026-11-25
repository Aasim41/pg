import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { colors } from '../../theme/colors';
import { useApp } from '../../context/AppContext';
import { X, ArrowRightLeft, Check } from 'lucide-react-native';

interface RoomShiftModalProps {
  visible: boolean;
  onClose: () => void;
}

export const RoomShiftModal: React.FC<RoomShiftModalProps> = ({ visible, onClose }) => {
  const { tenants, beds, shiftTenantRoom } = useApp();

  const vacantBeds = beds.filter((b) => b.status === 'vacant');
  const [selectedTenantId, setSelectedTenantId] = useState(tenants[0]?.id || '');
  const [targetBedLabel, setTargetBedLabel] = useState(vacantBeds[0]?.bedLabel || '');

  const currentTenant = tenants.find((t) => t.id === selectedTenantId);
  const targetBed = beds.find((b) => b.bedLabel === targetBedLabel);

  const handleShift = () => {
    if (!currentTenant || !targetBedLabel) return;

    shiftTenantRoom(currentTenant.id, targetBedLabel);
    Alert.alert(
      'Room Shifted Successfully! ✓',
      `${currentTenant.name} has been moved from ${currentTenant.bedLabel} to ${targetBedLabel}.\nOld bed is now vacant and ready for new booking.`,
      [{ text: 'OK', onPress: onClose }]
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Room / Bed Shifting</Text>
              <Text style={styles.subtitle}>
                Swap rooms seamlessly without losing documents or payment records
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body}>
            {/* Step 1: Select Tenant */}
            <Text style={styles.label}>1. SELECT TENANT TO SHIFT</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollRow}>
              {tenants.map((t) => {
                const isSelected = selectedTenantId === t.id;
                return (
                  <TouchableOpacity
                    key={t.id}
                    style={[styles.pill, isSelected && styles.pillSelected]}
                    onPress={() => setSelectedTenantId(t.id)}
                  >
                    <Text style={[styles.pillTitle, isSelected && styles.pillTitleSelected]}>
                      {t.name}
                    </Text>
                    <Text style={[styles.pillSub, isSelected && styles.pillSubSelected]}>
                      Current: {t.bedLabel}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Step 2: Select Target Vacant Bed */}
            <Text style={styles.label}>2. SELECT TARGET VACANT BED</Text>
            {vacantBeds.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollRow}>
                {vacantBeds.map((b) => {
                  const isSelected = targetBedLabel === b.bedLabel;
                  return (
                    <TouchableOpacity
                      key={b.id}
                      style={[styles.pill, isSelected && styles.pillSelected]}
                      onPress={() => setTargetBedLabel(b.bedLabel)}
                    >
                      <Text style={[styles.pillTitle, isSelected && styles.pillTitleSelected]}>
                        Bed {b.bedLabel}
                      </Text>
                      <Text style={[styles.pillSub, isSelected && styles.pillSubSelected]}>
                        ₹{b.rentAmount.toLocaleString()} / mo
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            ) : (
              <Text style={styles.emptyNotice}>No vacant beds available right now.</Text>
            )}

            {/* Shift Comparison Summary Card */}
            {currentTenant && targetBed && (
              <View style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={styles.summaryLabel}>FROM</Text>
                    <Text style={styles.summaryBed}>{currentTenant.bedLabel}</Text>
                    <Text style={styles.summaryRent}>₹{currentTenant.monthlyRent.toLocaleString()}</Text>
                  </View>

                  <ArrowRightLeft size={20} color={colors.primary} />

                  <View style={{ alignItems: 'center' }}>
                    <Text style={styles.summaryLabel}>TO</Text>
                    <Text style={styles.summaryBed}>{targetBed.bedLabel}</Text>
                    <Text style={styles.summaryRent}>₹{targetBed.rentAmount.toLocaleString()}</Text>
                  </View>
                </View>
              </View>
            )}

            <TouchableOpacity
              style={[styles.confirmBtn, !targetBedLabel && { opacity: 0.5 }]}
              onPress={handleShift}
              disabled={!targetBedLabel}
            >
              <Check size={18} color={colors.textInverse} />
              <Text style={styles.confirmBtnText}>Confirm Room Transfer</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 36,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    marginTop: 10,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.6,
    marginBottom: 8,
    marginTop: 12,
  },
  scrollRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  pill: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: colors.surfaceSubtle,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
    alignItems: 'center',
  },
  pillSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pillTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  pillTitleSelected: {
    color: colors.textInverse,
  },
  pillSub: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  pillSubSelected: {
    color: colors.textInverse,
    opacity: 0.8,
  },
  emptyNotice: {
    fontSize: 12,
    color: colors.danger,
    marginVertical: 8,
  },
  summaryCard: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginVertical: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textMuted,
  },
  summaryBed: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 2,
  },
  summaryRent: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  confirmBtn: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 10,
  },
  confirmBtnText: {
    color: colors.textInverse,
    fontSize: 14,
    fontWeight: '700',
  },
});
