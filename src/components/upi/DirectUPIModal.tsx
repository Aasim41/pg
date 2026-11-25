import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import { colors } from '../../theme/colors';
import { useApp } from '../../context/AppContext';
import { Bill } from '../../types';
import {
  launchUPIApp,
  getUPIQRCodeUrl,
  copyUPIId,
  isValidUTR,
} from '../../utils/upi';
import {
  X,
  Copy,
  ExternalLink,
  CheckCircle2,
  Banknote,
  QrCode,
  ShieldCheck,
  Check,
} from 'lucide-react-native';

interface DirectUPIModalProps {
  visible: boolean;
  bill: Bill;
  onClose: () => void;
}

export const DirectUPIModal: React.FC<DirectUPIModalProps> = ({ visible, bill, onClose }) => {
  const { ownerSettings, submitUPIPayment, requestCashPayment } = useApp();
  const [utrNumber, setUtrNumber] = useState('');
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [isCashMode, setIsCashMode] = useState(false);

  const upiParams = {
    upiId: ownerSettings.upiId,
    payeeName: ownerSettings.ownerName,
    amount: bill.totalAmount,
    note: `Rent_${bill.roomNumber}_${bill.month.replace(' ', '_')}`,
  };

  const handleLaunchUPI = async () => {
    const success = await launchUPIApp(upiParams);
    if (!success) {
      // If native intent couldn't open directly (e.g. simulator/iOS without registered scheme)
      setShowQR(true);
      Alert.alert(
        'UPI App Not Found',
        'You can copy the Owner UPI ID or scan the dynamic QR code below to complete payment in GPay / PhonePe / Paytm.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleCopyUPI = async () => {
    await copyUPIId(ownerSettings.upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSubmitUTR = () => {
    if (!isValidUTR(utrNumber)) {
      Alert.alert(
        'Invalid UTR Number',
        'Please enter a valid 12-digit Indian Bank UPI Reference (UTR) number found in your GPay / PhonePe / Paytm receipt.'
      );
      return;
    }

    submitUPIPayment(bill.id, utrNumber);
    Alert.alert(
      'Payment Submitted! ✓',
      'Your UTR has been sent to the Owner for 1-tap verification. Once approved, your receipt will be generated automatically.',
      [{ text: 'OK', onPress: onClose }]
    );
  };

  const handleConfirmCash = () => {
    requestCashPayment(bill.id);
    Alert.alert(
      'Cash Payment Requested',
      `Please hand over ₹${bill.totalAmount.toLocaleString()} in cash to ${ownerSettings.ownerName}. The owner will tap approve to mark this bill paid.`,
      [{ text: 'OK', onPress: onClose }]
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Direct Payment (0% Gateway Fee)</Text>
              <Text style={styles.headerSubtitle}>
                Directly to Owner's Bank Account • No Razorpay / No fees
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Amount Summary Card */}
            <View style={styles.amountCard}>
              <Text style={styles.amountLabel}>TOTAL BILL DUE</Text>
              <Text style={styles.amountValue}>₹{bill.totalAmount.toLocaleString()}</Text>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownText}>Rent: ₹{bill.rentAmount.toLocaleString()}</Text>
                {bill.electricityAmount > 0 && (
                  <Text style={styles.breakdownText}>
                    • Electricity: ₹{bill.electricityAmount.toLocaleString()}
                  </Text>
                )}
              </View>
            </View>

            {/* Mode Switcher: UPI vs Cash */}
            <View style={styles.modeTabs}>
              <TouchableOpacity
                style={[styles.modeTab, !isCashMode && styles.modeTabActive]}
                onPress={() => setIsCashMode(false)}
              >
                <Text style={[styles.modeTabText, !isCashMode && styles.modeTabTextActive]}>
                  ⚡ Pay via UPI (PhonePe / GPay)
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modeTab, isCashMode && styles.modeTabActive]}
                onPress={() => setIsCashMode(true)}
              >
                <Text style={[styles.modeTabText, isCashMode && styles.modeTabTextActive]}>
                  💵 Pay with Cash
                </Text>
              </TouchableOpacity>
            </View>

            {!isCashMode ? (
              // UPI PAYMENT FLOW
              <View style={styles.section}>
                {/* Payee Info */}
                <View style={styles.payeeBox}>
                  <View>
                    <Text style={styles.payeeLabel}>PAYEE: {ownerSettings.ownerName}</Text>
                    <Text style={styles.payeeUPI}>{ownerSettings.upiId}</Text>
                  </View>
                  <TouchableOpacity style={styles.copyBtn} onPress={handleCopyUPI}>
                    {copied ? (
                      <Check size={16} color={colors.success} />
                    ) : (
                      <Copy size={16} color={colors.textSecondary} />
                    )}
                    <Text style={[styles.copyBtnText, copied && { color: colors.success }]}>
                      {copied ? 'Copied' : 'Copy'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Big Action: Launch UPI Apps */}
                <TouchableOpacity style={styles.launchUpiBtn} onPress={handleLaunchUPI}>
                  <ExternalLink size={18} color={colors.textInverse} />
                  <Text style={styles.launchUpiBtnText}>
                    Open GPay / PhonePe / Paytm to Pay ₹{bill.totalAmount.toLocaleString()}
                  </Text>
                </TouchableOpacity>

                {/* QR Code Toggle for iPad / iPhone / Desktop */}
                <TouchableOpacity
                  style={styles.qrToggleBtn}
                  onPress={() => setShowQR(!showQR)}
                >
                  <QrCode size={16} color={colors.textSecondary} />
                  <Text style={styles.qrToggleBtnText}>
                    {showQR ? 'Hide QR Code' : 'Show Dynamic UPI QR Code to Scan'}
                  </Text>
                </TouchableOpacity>

                {showQR && (
                  <View style={styles.qrContainer}>
                    <Image
                      source={{ uri: getUPIQRCodeUrl(upiParams, 200) }}
                      style={styles.qrImage}
                    />
                    <Text style={styles.qrSub}>Scan using any UPI app to pay directly</Text>
                  </View>
                )}

                {/* Step 2: Enter UTR */}
                <View style={styles.utrSection}>
                  <View style={styles.stepBadge}>
                    <Text style={styles.stepBadgeText}>STEP 2: VERIFY PAYMENT</Text>
                  </View>
                  <Text style={styles.utrPrompt}>
                    After paying, paste the 12-digit UPI Reference / UTR Number from your transaction details:
                  </Text>
                  <TextInput
                    style={styles.utrInput}
                    placeholder="e.g. 432198765412 (12 digits)"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="number-pad"
                    maxLength={12}
                    value={utrNumber}
                    onChangeText={setUtrNumber}
                  />

                  <TouchableOpacity
                    style={[
                      styles.submitUtrBtn,
                      utrNumber.length === 12 && styles.submitUtrBtnActive,
                    ]}
                    onPress={handleSubmitUTR}
                  >
                    <CheckCircle2 size={18} color={colors.textInverse} />
                    <Text style={styles.submitUtrBtnText}>Submit UTR for Owner Verification</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              // CASH PAYMENT FLOW
              <View style={styles.cashSection}>
                <View style={styles.cashNoticeBox}>
                  <Banknote size={36} color={colors.success} />
                  <Text style={styles.cashNoticeTitle}>Cash Payment</Text>
                  <Text style={styles.cashNoticeText}>
                    Hand over ₹{bill.totalAmount.toLocaleString()} in physical cash directly to{' '}
                    <Text style={{ fontWeight: '700' }}>{ownerSettings.ownerName}</Text> or the PG Manager.
                  </Text>
                </View>

                <TouchableOpacity style={styles.cashConfirmBtn} onPress={handleConfirmCash}>
                  <Text style={styles.cashConfirmBtnText}>
                    Confirm & Request Owner Cash Receipt
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Zero Commission Trust Badge */}
            <View style={styles.trustBadge}>
              <ShieldCheck size={14} color={colors.success} />
              <Text style={styles.trustBadgeText}>
                Zero commission • Instant bank-to-bank settlement • 100% Secure
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  headerSubtitle: {
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
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  amountCard: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    marginBottom: 16,
  },
  amountLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.8,
  },
  amountValue: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
    marginVertical: 4,
  },
  breakdownRow: {
    flexDirection: 'row',
    gap: 6,
  },
  breakdownText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  modeTabs: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: 8,
    padding: 3,
    marginBottom: 16,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  modeTabActive: {
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  modeTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  modeTabTextActive: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  section: {
    gap: 12,
  },
  payeeBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.surfaceSubtle,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  payeeLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
  },
  payeeUPI: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 2,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: colors.surface,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  copyBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  launchUpiBtn: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 10,
  },
  launchUpiBtnText: {
    color: colors.textInverse,
    fontSize: 14,
    fontWeight: '700',
  },
  qrToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  qrToggleBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    textDecorationLine: 'underline',
  },
  qrContainer: {
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.surfaceSubtle,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  qrImage: {
    width: 190,
    height: 190,
    borderRadius: 8,
  },
  qrSub: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 8,
  },
  utrSection: {
    marginTop: 8,
    padding: 14,
    backgroundColor: colors.surfaceSubtle,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stepBadge: {
    backgroundColor: colors.surfaceMuted,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginBottom: 6,
  },
  stepBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  utrPrompt: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 10,
    lineHeight: 16,
  },
  utrInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 10,
  },
  submitUtrBtn: {
    backgroundColor: colors.surfaceMuted,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
  },
  submitUtrBtnActive: {
    backgroundColor: colors.success,
  },
  submitUtrBtnText: {
    color: colors.textInverse,
    fontSize: 13,
    fontWeight: '700',
  },
  cashSection: {
    padding: 16,
    alignItems: 'center',
    gap: 16,
  },
  cashNoticeBox: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.successLight,
    borderWidth: 1,
    borderColor: colors.successBorder,
    borderRadius: 12,
    width: '100%',
  },
  cashNoticeTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.success,
    marginTop: 8,
  },
  cashNoticeText: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  cashConfirmBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  cashConfirmBtnText: {
    color: colors.textInverse,
    fontSize: 14,
    fontWeight: '700',
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 20,
    marginBottom: 30,
  },
  trustBadgeText: {
    fontSize: 11,
    color: colors.success,
    fontWeight: '600',
  },
});
