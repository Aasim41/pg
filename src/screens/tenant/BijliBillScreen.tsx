import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { colors } from '../../theme/colors';
import { useApp } from '../../context/AppContext';
import { DirectUPIModal } from '../../components/upi/DirectUPIModal';
import {
  Zap,
  CheckCircle2,
  Users,
  Camera,
  Info,
  CreditCard,
} from 'lucide-react-native';

export const BijliBillScreen: React.FC = () => {
  const { currentTenant, rooms, bills, ownerSettings } = useApp();
  const [upiModalVisible, setUpiModalVisible] = useState(false);

  const room = rooms.find((r) => r.roomNumber === currentTenant.roomNumber);
  const currentBill = bills.find(
    (b) => b.tenantId === currentTenant.id && (b.status === 'unpaid' || b.status === 'verification_pending')
  );

  const isIncluded = currentTenant.electricityType === 'included' || room?.electricityType === 'included';

  const previousReading = room?.previousReading || 4186;
  const currentReading = room?.currentReading || 4400;
  const unitsConsumed = Math.max(0, currentReading - previousReading);
  const ratePerUnit = room?.ratePerUnit || ownerSettings.ratePerUnit || 9;
  const totalRoomBill = unitsConsumed * ratePerUnit;
  const roomOccupantCount = 2; // Room 203 has 2 roommates
  const tenantShare = Math.round(totalRoomBill / roomOccupantCount);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.subTitle}>ELECTRICITY BILL</Text>
          <Text style={styles.title}>Bijli Ka Bill</Text>
          <Text style={styles.roomTag}>Room {currentTenant.roomNumber} (Sub-meter)</Text>
        </View>
        <View style={styles.zapIconBox}>
          <Zap size={22} color={colors.warning} />
        </View>
      </View>

      {/* Case 1: Electricity Included in Flat Rent */}
      {isIncluded ? (
        <View style={styles.includedCard}>
          <View style={styles.includedIconBox}>
            <CheckCircle2 size={32} color={colors.success} />
          </View>
          <Text style={styles.includedTitle}>Electricity Included in Rent</Text>
          <Text style={styles.includedDesc}>
            Your room has flat-rate billing. No separate meter readings, sub-meter splits, or extra bills apply to your stay.
          </Text>
          <View style={styles.includedBadge}>
            <Text style={styles.includedBadgeText}>₹0 EXTRA CHARGES</Text>
          </View>
        </View>
      ) : (
        // Case 2: Metered Split
        <View>
          {/* Main Reading Card */}
          <View style={styles.readingCard}>
            <View style={styles.readingGrid}>
              <View style={styles.readingCol}>
                <Text style={styles.readingLabel}>PREVIOUS</Text>
                <Text style={styles.readingValue}>{previousReading.toLocaleString()}</Text>
                <Text style={styles.readingDate}>01 Nov</Text>
              </View>

              <View style={styles.readingArrow}>
                <Text style={styles.arrowText}>➔</Text>
              </View>

              <View style={styles.readingCol}>
                <Text style={styles.readingLabel}>CURRENT</Text>
                <Text style={styles.readingValue}>{currentReading.toLocaleString()}</Text>
                <Text style={styles.readingDate}>Today</Text>
              </View>

              <View style={styles.unitsBadge}>
                <Text style={styles.unitsBadgeNumber}>{unitsConsumed}</Text>
                <Text style={styles.unitsBadgeLabel}>Units</Text>
              </View>
            </View>

            {/* Transparent Calculation Breakdown */}
            <View style={styles.calcBox}>
              <View style={styles.calcRow}>
                <Text style={styles.calcText}>Total Consumption</Text>
                <Text style={styles.calcVal}>{unitsConsumed} Units × ₹{ratePerUnit}/unit</Text>
              </View>
              <View style={styles.calcRow}>
                <Text style={styles.calcText}>Total Room Cost</Text>
                <Text style={styles.calcVal}>₹{totalRoomBill.toLocaleString()}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.calcRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Users size={14} color={colors.textSecondary} />
                  <Text style={styles.calcText}>Roommates Sharing (2)</Text>
                </View>
                <Text style={[styles.calcVal, { fontWeight: '800', color: colors.primary }]}>
                  ÷ 2 Person
                </Text>
              </View>
              <View style={[styles.calcRow, styles.finalShareRow]}>
                <Text style={styles.finalShareLabel}>Aapka Hissa (Your Share)</Text>
                <Text style={styles.finalShareAmount}>₹{tenantShare.toLocaleString()}</Text>
              </View>
            </View>

            {/* Meter Photo Proof Section */}
            <View style={styles.photoProofSection}>
              <View style={styles.photoProofHeader}>
                <Camera size={14} color={colors.textSecondary} />
                <Text style={styles.photoProofTitle}>Meter Photo Proof (Attached by Manager)</Text>
              </View>
              <View style={styles.mockMeterImage}>
                <Zap size={24} color={colors.textMuted} />
                <Text style={styles.mockMeterText}>
                  Digital Meter Reading: {currentReading} kWh • Verified
                </Text>
              </View>
            </View>

            {/* Action to pay */}
            {currentBill && currentBill.status === 'unpaid' && (
              <TouchableOpacity
                style={styles.payWithRentBtn}
                onPress={() => setUpiModalVisible(true)}
              >
                <CreditCard size={18} color={colors.textInverse} />
                <Text style={styles.payWithRentBtnText}>
                  Pay ₹{tenantShare} With Monthly Rent (Total: ₹{currentBill.totalAmount.toLocaleString()})
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Explanation note */}
          <View style={styles.infoBox}>
            <Info size={16} color={colors.textSecondary} />
            <Text style={styles.infoText}>
              Sub-meter reading is recorded monthly by the manager. Your share is bundled automatically into your monthly rent invoice.
            </Text>
          </View>
        </View>
      )}

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
  roomTag: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
    marginTop: 2,
  },
  zapIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.warningLight,
    borderWidth: 1,
    borderColor: colors.warningBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  includedCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  includedIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.successLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  includedTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  includedDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    marginVertical: 12,
  },
  includedBadge: {
    backgroundColor: colors.successLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.successBorder,
  },
  includedBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.success,
  },
  readingCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 16,
  },
  readingGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  readingCol: {
    alignItems: 'center',
  },
  readingLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  readingValue: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 2,
  },
  readingDate: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  readingArrow: {
    paddingHorizontal: 4,
  },
  arrowText: {
    fontSize: 16,
    color: colors.textMuted,
  },
  unitsBadge: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  unitsBadgeNumber: {
    color: colors.textInverse,
    fontSize: 18,
    fontWeight: '900',
  },
  unitsBadgeLabel: {
    color: colors.textInverse,
    fontSize: 10,
    fontWeight: '700',
    opacity: 0.8,
  },
  calcBox: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: 12,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  calcRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  calcText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  calcVal: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  finalShareRow: {
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  finalShareLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  finalShareAmount: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.primary,
  },
  photoProofSection: {
    marginBottom: 16,
  },
  photoProofHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  photoProofTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  mockMeterImage: {
    height: 90,
    backgroundColor: colors.surfaceSubtle,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  mockMeterText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  payWithRentBtn: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 10,
  },
  payWithRentBtnText: {
    color: colors.textInverse,
    fontSize: 13,
    fontWeight: '700',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 12,
    backgroundColor: colors.surfaceSubtle,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 40,
  },
  infoText: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 17,
    flex: 1,
  },
});
