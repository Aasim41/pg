import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native';
import { colors } from '../../theme/colors';
import { useApp } from '../../context/AppContext';
import { ExitSettlementModal } from './ExitSettlementModal';
import { RoomShiftModal } from '../manager/RoomShiftModal';
import {
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  Send,
  ShieldCheck,
  UserMinus,
  ArrowRightLeft,
  XCircle,
} from 'lucide-react-native';

export const KirayaHisaabScreen: React.FC = () => {
  const { bills, approvePayment, rejectPayment, beds, tenants, ownerSettings } = useApp();

  const [exitModalVisible, setExitModalVisible] = useState(false);
  const [shiftModalVisible, setShiftModalVisible] = useState(false);

  // Financial Stats
  const paidBills = bills.filter((b) => b.status === 'paid');
  const totalCollected = paidBills.reduce((acc, curr) => acc + curr.totalAmount, 258000); // Base historical + live

  const unpaidBills = bills.filter((b) => b.status === 'unpaid');
  const totalPending = unpaidBills.reduce((acc, curr) => acc + curr.totalAmount, 0);

  const verificationPendingBills = bills.filter((b) => b.status === 'verification_pending');

  const totalDeposits = tenants.reduce((acc, curr) => acc + curr.depositAmount, 0);
  const occupiedBedsCount = beds.filter((b) => b.status === 'occupied').length;

  const handleSendReminder = async (tenantName: string, roomNo: string, amount: number, daysLate: number) => {
    try {
      await Share.share({
        message: `Namaste ${tenantName},\nAapka PG (${ownerSettings.pgName}) ka rent due hai:\nRoom: ${roomNo}\nAmount: ₹${amount.toLocaleString()}\nStatus: ${daysLate} din late\nKripya UPI ya cash se turant pay karein.\nUPI ID: ${ownerSettings.upiId}\nDhanyawad!`,
      });
    } catch {
      Alert.alert('Notice', `Reminder prepared for ${tenantName}.`);
    }
  };

  const handleApprove = (billId: string, name: string, amount: number, method: 'upi_direct' | 'cash') => {
    approvePayment(billId, method);
    Alert.alert('Payment Approved! ✓', `₹${amount.toLocaleString()} from ${name} marked as PAID. Receipt generated.`);
  };

  const handleReject = (billId: string, name: string) => {
    rejectPayment(billId);
    Alert.alert('Payment Rejected', `Verification request for ${name} has been rejected.`);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.subTitle}>FINANCIAL DASHBOARD</Text>
          <Text style={styles.title}>Kiraya Ka Hisaab</Text>
        </View>
        <View style={styles.iconBox}>
          <TrendingUp size={22} color={colors.primary} />
        </View>
      </View>

      {/* Main Revenue Card */}
      <View style={styles.revenueCard}>
        <Text style={styles.revLabel}>IS MAHINE MILA (COLLECTED IN NOV)</Text>
        <View style={styles.amountRow}>
          <Text style={styles.currencySymbol}>₹</Text>
          <Text style={styles.revAmount}>{totalCollected.toLocaleString()}</Text>
        </View>

        <View style={styles.occupancyBarRow}>
          <Text style={styles.occupancyText}>
            Occupancy: {occupiedBedsCount} / {beds.length} beds filled
          </Text>
        </View>

        <View style={styles.subStatsRow}>
          <View style={styles.subStatBox}>
            <Text style={styles.subStatLabel}>BAAKI (DUE)</Text>
            <Text style={[styles.subStatVal, { color: colors.danger }]}>
              ₹{totalPending.toLocaleString()} ({unpaidBills.length} log)
            </Text>
          </View>
          <View style={styles.subStatDivider} />
          <View style={styles.subStatBox}>
            <Text style={styles.subStatLabel}>SECURITY DEPOSITS</Text>
            <Text style={styles.subStatVal}>₹{totalDeposits.toLocaleString()}</Text>
          </View>
        </View>
      </View>

      {/* Quick Malik Action Buttons (Solo Owner superpowers!) */}
      <View style={styles.quickOpsRow}>
        <TouchableOpacity
          style={styles.quickOpBtn}
          onPress={() => setShiftModalVisible(true)}
        >
          <ArrowRightLeft size={16} color={colors.primary} />
          <Text style={styles.quickOpBtnText}>Shift Room</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.quickOpBtn, { borderColor: colors.dangerBorder }]}
          onPress={() => setExitModalVisible(true)}
        >
          <UserMinus size={16} color={colors.danger} />
          <Text style={[styles.quickOpBtnText, { color: colors.danger }]}>Exit & Settle</Text>
        </TouchableOpacity>
      </View>

      {/* UTR & Cash Approval Queue */}
      {verificationPendingBills.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Clock size={16} color={colors.warning} />
            <Text style={[styles.sectionTitle, { color: colors.warning }]}>
              PAYMENT APPROVAL QUEUE ({verificationPendingBills.length})
            </Text>
          </View>

          {verificationPendingBills.map((b) => (
            <View key={b.id} style={styles.approvalCard}>
              <View style={styles.approvalHeader}>
                <View>
                  <Text style={styles.approvalTenant}>{b.tenantName}</Text>
                  <Text style={styles.approvalRoom}>
                    Room {b.roomNumber} ({b.bedLabel})
                  </Text>
                </View>
                <Text style={styles.approvalAmount}>₹{b.totalAmount.toLocaleString()}</Text>
              </View>

              <View style={styles.utrBadge}>
                <Text style={styles.utrBadgeLabel}>
                  {b.paymentMethod === 'cash' ? 'Cash Received Request' : `UPI Ref (UTR): ${b.utrNumber}`}
                </Text>
              </View>

              <View style={styles.approvalActions}>
                <TouchableOpacity
                  style={styles.approveBtn}
                  onPress={() => handleApprove(b.id, b.tenantName, b.totalAmount, b.paymentMethod || 'upi_direct')}
                >
                  <CheckCircle2 size={16} color={colors.textInverse} />
                  <Text style={styles.approveBtnText}>Approve & Clear</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.rejectBtn}
                  onPress={() => handleReject(b.id, b.tenantName)}
                >
                  <XCircle size={16} color={colors.danger} />
                  <Text style={styles.rejectBtnText}>Reject</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Overdue Tenants List (Baaki Kiraya) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>BAAKI KIRAYA (OVERDUE RENT)</Text>

        {unpaidBills.length > 0 ? (
          unpaidBills.map((bill) => {
            const daysLate = bill.daysLate || 2;
            return (
              <View key={bill.id} style={styles.overdueCard}>
                <View style={styles.overdueLeft}>
                  <View style={styles.tenantInitialBox}>
                    <Text style={styles.tenantInitial}>
                      {bill.tenantName.slice(0, 2).toUpperCase()}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.overdueTenant}>
                      Room {bill.roomNumber} - {bill.tenantName}
                    </Text>
                    <Text style={styles.daysLateText}>{daysLate} din late</Text>
                  </View>
                </View>

                <View style={styles.overdueRight}>
                  <Text style={styles.overdueAmount}>₹{bill.totalAmount.toLocaleString()}</Text>
                  <TouchableOpacity
                    style={styles.reminderBtn}
                    onPress={() =>
                      handleSendReminder(bill.tenantName, bill.roomNumber, bill.totalAmount, daysLate)
                    }
                  >
                    <Send size={12} color={colors.primary} />
                    <Text style={styles.reminderBtnText}>Reminder Bhejo</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        ) : (
          <View style={styles.allPaidBox}>
            <CheckCircle2 size={24} color={colors.success} />
            <Text style={styles.allPaidText}>All tenants have cleared rent for this month!</Text>
          </View>
        )}
      </View>

      {/* Modals */}
      <ExitSettlementModal
        visible={exitModalVisible}
        onClose={() => setExitModalVisible(false)}
      />

      <RoomShiftModal
        visible={shiftModalVisible}
        onClose={() => setShiftModalVisible(false)}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  subTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 0.8,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 2,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  revenueCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 16,
  },
  revLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 0.8,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginVertical: 10,
  },
  currencySymbol: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    marginRight: 2,
  },
  revAmount: {
    fontSize: 34,
    fontWeight: '900',
    color: colors.textPrimary,
    letterSpacing: -1,
  },
  occupancyBarRow: {
    marginBottom: 16,
  },
  occupancyText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  subStatsRow: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  subStatBox: {
    flex: 1,
    alignItems: 'center',
  },
  subStatDivider: {
    width: 1,
    backgroundColor: colors.border,
  },
  subStatLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  subStatVal: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 3,
  },
  quickOpsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  quickOpBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickOpBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 0.8,
  },
  approvalCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.warningBorder,
    marginBottom: 10,
  },
  approvalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  approvalTenant: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  approvalRoom: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  approvalAmount: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.primary,
  },
  utrBadge: {
    backgroundColor: colors.warningLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginVertical: 8,
  },
  utrBadgeLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.warning,
  },
  approvalActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  approveBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.success,
    paddingVertical: 10,
    borderRadius: 6,
  },
  approveBtnText: {
    color: colors.textInverse,
    fontSize: 12,
    fontWeight: '700',
  },
  rejectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.dangerLight,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  rejectBtnText: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: '700',
  },
  overdueCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 8,
  },
  overdueLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  tenantInitialBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tenantInitial: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  overdueTenant: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  daysLateText: {
    fontSize: 11,
    color: colors.danger,
    fontWeight: '600',
    marginTop: 1,
  },
  overdueRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  overdueAmount: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  reminderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surfaceSubtle,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  reminderBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary,
  },
  allPaidBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 16,
    backgroundColor: colors.successLight,
    borderRadius: 10,
  },
  allPaidText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.success,
  },
});
