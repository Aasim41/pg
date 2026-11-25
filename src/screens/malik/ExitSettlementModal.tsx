import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { colors } from '../../theme/colors';
import { useApp } from '../../context/AppContext';
import { X, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react-native';

interface ExitSettlementModalProps {
  visible: boolean;
  onClose: () => void;
}

export const ExitSettlementModal: React.FC<ExitSettlementModalProps> = ({ visible, onClose }) => {
  const { tenants, settleTenantExit } = useApp();

  const [selectedTenantId, setSelectedTenantId] = useState(tenants[0]?.id || '');
  const [unpaidRent, setUnpaidRent] = useState('0');
  const [unpaidElec, setUnpaidElec] = useState('0');
  const [damages, setDamages] = useState('0');
  const [remarks, setRemarks] = useState('Normal move-out after notice period');

  const selectedTenant = tenants.find((t) => t.id === selectedTenantId) || tenants[0];
  const deposit = selectedTenant ? selectedTenant.depositAmount : 15000;

  const rentDed = parseInt(unpaidRent, 10) || 0;
  const elecDed = parseInt(unpaidElec, 10) || 0;
  const dmgDed = parseInt(damages, 10) || 0;
  const totalDeductions = rentDed + elecDed + dmgDed;
  const netRefund = Math.max(0, deposit - totalDeductions);

  const handleSettle = () => {
    if (!selectedTenant) return;

    const { netRefund: finalRefund, settlementId } = settleTenantExit(selectedTenant.id, {
      unpaidRent: rentDed,
      unpaidElectricity: elecDed,
      damages: dmgDed,
      remarks,
    });

    Alert.alert(
      'Exit Settled & Bed Vacated! ✓',
      `Settlement #${settlementId}\nTenant: ${selectedTenant.name}\nBed ${selectedTenant.bedLabel} is now VACANT.\nDeposit: ₹${deposit.toLocaleString()}\nDeductions: -₹${totalDeductions.toLocaleString()}\nNet Refund to Tenant: ₹${finalRefund.toLocaleString()}`,
      [{ text: 'OK', onPress: onClose }]
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Tenant Exit & Deposit Settlement</Text>
              <Text style={styles.subtitle}>
                Calculate deductions, refund balance, and auto-vacate bed
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body}>
            {/* Select Leaving Tenant */}
            <Text style={styles.label}>SELECT TENANT MOVING OUT</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tenantScroll}>
              {tenants.map((t) => {
                const isSelected = selectedTenantId === t.id;
                return (
                  <TouchableOpacity
                    key={t.id}
                    style={[styles.tenantChip, isSelected && styles.tenantChipSelected]}
                    onPress={() => setSelectedTenantId(t.id)}
                  >
                    <Text style={[styles.tenantChipName, isSelected && styles.tenantChipNameSelected]}>
                      {t.name}
                    </Text>
                    <Text style={[styles.tenantChipBed, isSelected && styles.tenantChipBedSelected]}>
                      Bed {t.bedLabel}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Deposit Info Card */}
            {selectedTenant && (
              <View style={styles.depositInfoCard}>
                <Text style={styles.depositLabel}>SECURITY DEPOSIT HELD</Text>
                <Text style={styles.depositAmount}>₹{deposit.toLocaleString()}</Text>
              </View>
            )}

            {/* Deductions breakdown */}
            <Text style={styles.label}>SETTLEMENT DEDUCTIONS</Text>
            <View style={styles.deductionRow}>
              <Text style={styles.deductionLabel}>Unpaid Rent (₹)</Text>
              <TextInput
                style={styles.deductionInput}
                keyboardType="number-pad"
                value={unpaidRent}
                onChangeText={setUnpaidRent}
              />
            </View>

            <View style={styles.deductionRow}>
              <Text style={styles.deductionLabel}>Unpaid Electricity (₹)</Text>
              <TextInput
                style={styles.deductionInput}
                keyboardType="number-pad"
                value={unpaidElec}
                onChangeText={setUnpaidElec}
              />
            </View>

            <View style={styles.deductionRow}>
              <Text style={styles.deductionLabel}>Room Damages / Repairs (₹)</Text>
              <TextInput
                style={styles.deductionInput}
                keyboardType="number-pad"
                value={damages}
                onChangeText={setDamages}
              />
            </View>

            <View style={styles.deductionRow}>
              <Text style={styles.deductionLabel}>Remarks</Text>
              <TextInput
                style={[styles.deductionInput, { width: '55%' }]}
                value={remarks}
                onChangeText={setRemarks}
              />
            </View>

            {/* Final Calculation Result */}
            <View style={styles.netRefundCard}>
              <View style={styles.calcLine}>
                <Text style={styles.calcLineText}>Security Deposit</Text>
                <Text style={styles.calcLineVal}>₹{deposit.toLocaleString()}</Text>
              </View>
              <View style={styles.calcLine}>
                <Text style={styles.calcLineText}>Total Deductions</Text>
                <Text style={[styles.calcLineVal, { color: colors.danger }]}>
                  -₹{totalDeductions.toLocaleString()}
                </Text>
              </View>
              <View style={styles.calcDivider} />
              <View style={styles.calcLine}>
                <Text style={styles.netRefundLabel}>Net Refund to Tenant</Text>
                <Text style={styles.netRefundVal}>₹{netRefund.toLocaleString()}</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.settleBtn} onPress={handleSettle} activeOpacity={0.85}>
              <CheckCircle2 size={18} color={colors.textInverse} />
              <Text style={styles.settleBtnText}>Confirm Exit & Vacate Bed</Text>
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
    maxHeight: '88%',
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
    marginTop: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.6,
    marginBottom: 8,
    marginTop: 12,
  },
  tenantScroll: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  tenantChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.surfaceSubtle,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
  },
  tenantChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tenantChipName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  tenantChipNameSelected: {
    color: colors.textInverse,
  },
  tenantChipBed: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  tenantChipBedSelected: {
    color: colors.textInverse,
    opacity: 0.8,
  },
  depositInfoCard: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    marginBottom: 12,
  },
  depositLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 0.6,
  },
  depositAmount: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.primary,
    marginTop: 2,
  },
  deductionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  deductionLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  deductionInput: {
    width: 100,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'right',
  },
  netRefundCard: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 14,
    gap: 8,
  },
  calcLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  calcLineText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  calcLineVal: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  calcDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 2,
  },
  netRefundLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  netRefundVal: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.success,
  },
  settleBtn: {
    backgroundColor: colors.danger,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 20,
    marginBottom: 20,
  },
  settleBtnText: {
    color: colors.textInverse,
    fontSize: 14,
    fontWeight: '700',
  },
});
