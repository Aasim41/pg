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
import { DirectUPIModal } from '../../components/upi/DirectUPIModal';
import {
  CreditCard,
  CheckCircle2,
  Clock,
  Download,
  Share2,
  AlertCircle,
  FileText,
  ShieldCheck,
} from 'lucide-react-native';

export const MeraKirayaScreen: React.FC = () => {
  const { currentTenant, bills } = useApp();
  const [upiModalVisible, setUpiModalVisible] = useState(false);

  // Active current bill for this tenant
  const currentBill = bills.find(
    (b) => b.tenantId === currentTenant.id && (b.status === 'unpaid' || b.status === 'verification_pending')
  ) || bills.find((b) => b.tenantId === currentTenant.id);

  // Past paid bills
  const pastBills = bills.filter(
    (b) => b.tenantId === currentTenant.id && b.status === 'paid'
  );

  const handleShareReceipt = async (billMonth: string, amount: number) => {
    try {
      await Share.share({
        message: `Aapka PG Rent Receipt\nTenant: ${currentTenant.name} (${currentTenant.bedLabel})\nMonth: ${billMonth}\nAmount: ₹${amount.toLocaleString()}\nStatus: PAID ✓\nThank you!`,
      });
    } catch {
      Alert.alert('Notice', 'Receipt copied to clipboard / share panel.');
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Top Tenant Header */}
      <View style={styles.tenantHeader}>
        <View>
          <Text style={styles.welcomeText}>MERA KIRAYA (MY RENT)</Text>
          <Text style={styles.tenantName}>{currentTenant.name}</Text>
          <Text style={styles.roomBadge}>
            Room {currentTenant.roomNumber} • Bed {currentTenant.bedLabel}
          </Text>
        </View>
        <View style={styles.statusIndicator}>
          {currentBill?.status === 'paid' ? (
            <View style={[styles.badge, { backgroundColor: colors.successLight, borderColor: colors.successBorder }]}>
              <CheckCircle2 size={14} color={colors.success} />
              <Text style={[styles.badgeText, { color: colors.success }]}>PAID</Text>
            </View>
          ) : currentBill?.status === 'verification_pending' ? (
            <View style={[styles.badge, { backgroundColor: colors.warningLight, borderColor: colors.warningBorder }]}>
              <Clock size={14} color={colors.warning} />
              <Text style={[styles.badgeText, { color: colors.warning }]}>VERIFYING</Text>
            </View>
          ) : (
            <View style={[styles.badge, { backgroundColor: colors.dangerLight, borderColor: colors.dangerBorder }]}>
              <AlertCircle size={14} color={colors.danger} />
              <Text style={[styles.badgeText, { color: colors.danger }]}>DUE</Text>
            </View>
          )}
        </View>
      </View>

      {/* Main Rent Card */}
      {currentBill && (
        <View style={styles.mainCard}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardMonth}>{currentBill.month}</Text>
            <Text style={styles.dueDateText}>Due by 5th</Text>
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.currencySymbol}>₹</Text>
            <Text style={styles.totalAmount}>{currentBill.totalAmount.toLocaleString()}</Text>
          </View>

          {/* Breakdown Items */}
          <View style={styles.breakdownBox}>
            <View style={styles.breakdownItem}>
              <Text style={styles.itemLabel}>Room Rent</Text>
              <Text style={styles.itemValue}>₹{currentBill.rentAmount.toLocaleString()}</Text>
            </View>
            <View style={styles.breakdownItem}>
              <Text style={styles.itemLabel}>
                Electricity {currentBill.electricityType === 'included' ? '(Included)' : `(${currentBill.electricityUnits} units share)`}
              </Text>
              <Text style={styles.itemValue}>
                {currentBill.electricityAmount > 0 ? `₹${currentBill.electricityAmount.toLocaleString()}` : '₹0'}
              </Text>
            </View>
          </View>

          {/* Action Button */}
          {currentBill.status === 'unpaid' ? (
            <TouchableOpacity
              style={styles.payBtn}
              onPress={() => setUpiModalVisible(true)}
              activeOpacity={0.85}
            >
              <CreditCard size={18} color={colors.textInverse} />
              <Text style={styles.payBtnText}>
                Pay ₹{currentBill.totalAmount.toLocaleString()} (0% Fee Direct UPI / Cash)
              </Text>
            </TouchableOpacity>
          ) : currentBill.status === 'verification_pending' ? (
            <View style={styles.pendingCard}>
              <Clock size={18} color={colors.warning} />
              <View style={{ flex: 1 }}>
                <Text style={styles.pendingTitle}>Payment Verification in Progress</Text>
                <Text style={styles.pendingSub}>
                  UTR: {currentBill.utrNumber || 'Cash Request'}. The owner has been notified to confirm.
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.paidSuccessCard}>
              <CheckCircle2 size={20} color={colors.success} />
              <Text style={styles.paidSuccessText}>
                Rent for {currentBill.month} is fully cleared!
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Security & Direct transfer guarantee */}
      <View style={styles.infoBanner}>
        <ShieldCheck size={16} color={colors.textSecondary} />
        <Text style={styles.infoBannerText}>
          Payments go directly to the PG Owner's bank account with 0% gateway deductions.
        </Text>
      </View>

      {/* Past Payment Receipts History */}
      <View style={styles.historySection}>
        <Text style={styles.sectionTitle}>PAST RECEIPTS & HISTORY</Text>

        {pastBills.length > 0 ? (
          pastBills.map((past) => (
            <View key={past.id} style={styles.historyCard}>
              <View style={styles.historyLeft}>
                <View style={styles.receiptIconBox}>
                  <FileText size={18} color={colors.textSecondary} />
                </View>
                <View>
                  <Text style={styles.historyMonth}>{past.month}</Text>
                  <Text style={styles.historyDate}>Paid on {past.paidDate || 'Paid'}</Text>
                </View>
              </View>

              <View style={styles.historyRight}>
                <Text style={styles.historyAmount}>₹{past.totalAmount.toLocaleString()}</Text>
                <TouchableOpacity
                  style={styles.shareBtn}
                  onPress={() => handleShareReceipt(past.month, past.totalAmount)}
                >
                  <Share2 size={14} color={colors.textSecondary} />
                  <Text style={styles.shareBtnText}>Receipt</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No previous receipts recorded yet.</Text>
        )}
      </View>

      {/* Direct UPI Modal */}
      {currentBill && (
        <DirectUPIModal
          visible={upiModalVisible}
          bill={currentBill}
          onClose={() => setUpiModalVisible(false)}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  tenantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  welcomeText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 0.8,
  },
  tenantName: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 2,
  },
  roomBadge: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 2,
  },
  statusIndicator: {
    paddingTop: 4,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  mainCard: {
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
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardMonth: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  dueDateText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.danger,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginVertical: 14,
  },
  currencySymbol: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    marginRight: 2,
  },
  totalAmount: {
    fontSize: 36,
    fontWeight: '900',
    color: colors.textPrimary,
    letterSpacing: -1,
  },
  breakdownBox: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: 10,
    padding: 12,
    gap: 8,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  breakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  itemValue: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  payBtn: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 10,
  },
  payBtnText: {
    color: colors.textInverse,
    fontSize: 14,
    fontWeight: '700',
  },
  pendingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: colors.warningLight,
    borderWidth: 1,
    borderColor: colors.warningBorder,
    borderRadius: 10,
  },
  pendingTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.warning,
  },
  pendingSub: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  paidSuccessCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: colors.successLight,
    borderWidth: 1,
    borderColor: colors.successBorder,
    borderRadius: 10,
  },
  paidSuccessText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.success,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: colors.surfaceSubtle,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20,
  },
  infoBannerText: {
    fontSize: 12,
    color: colors.textSecondary,
    flex: 1,
  },
  historySection: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  historyCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  receiptIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyMonth: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  historyDate: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  historyRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  historyAmount: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    backgroundColor: colors.surfaceSubtle,
  },
  shareBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  emptyText: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    marginVertical: 10,
  },
});
