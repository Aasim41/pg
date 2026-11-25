import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { colors } from '../../theme/colors';
import { useApp } from '../../context/AppContext';
import { ElectricityType } from '../../types';
import {
  UserPlus,
  CheckCircle2,
  FileCheck,
  Calendar,
  Zap,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react-native';

export const NayaTenantScreen: React.FC = () => {
  const { beds, addTenant } = useApp();

  const vacantBeds = beds.filter((b) => b.status === 'vacant');

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedBed, setSelectedBed] = useState(vacantBeds[0]?.bedLabel || '103-B');
  const [rent, setRent] = useState('8500');
  const [deposit, setDeposit] = useState('15000');
  const [joinDay, setJoinDay] = useState('1'); // Joining day of current month (1-30)
  const [electricityType, setElectricityType] = useState<ElectricityType>('metered');

  // KYC toggles
  const [idProof, setIdProof] = useState(true);
  const [photo, setPhoto] = useState(true);
  const [agreement, setAgreement] = useState(false);
  const [policeVerification, setPoliceVerification] = useState(false);

  // Pro-rata rent calculation
  const dayNum = parseInt(joinDay, 10) || 1;
  const daysRemaining = Math.max(1, 30 - dayNum + 1);
  const fullRent = parseInt(rent, 10) || 8500;
  const isProrated = dayNum > 1;
  const proratedFirstRent = Math.round((fullRent / 30) * daysRemaining);

  const handleSaveTenant = () => {
    if (!name.trim() || !phone.trim()) {
      Alert.alert('Required Fields', 'Please enter tenant name and phone number.');
      return;
    }

    const roomNum = selectedBed.split('-')[0];

    addTenant(
      {
        name: name.trim(),
        phone: phone.trim(),
        roomNumber: roomNum,
        bedLabel: selectedBed,
        joinDate: `2026-11-${dayNum < 10 ? '0' + dayNum : dayNum}`,
        monthlyRent: fullRent,
        depositAmount: parseInt(deposit, 10) || 15000,
        electricityType,
        kyc: {
          idProof,
          photo,
          agreement,
          policeVerification,
        },
      },
      isProrated ? proratedFirstRent : fullRent
    );

    Alert.alert(
      'Tenant Onboarded! ✓',
      `Bed ${selectedBed} is now marked Occupied.\nFirst month bill: ₹${(isProrated ? proratedFirstRent : fullRent).toLocaleString()} (${daysRemaining} days pro-rata).`
    );

    setName('');
    setPhone('');
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.subTitle}>ONBOARDING</Text>
          <Text style={styles.title}>Naya Tenant (Add Tenant)</Text>
        </View>
        <View style={styles.iconBox}>
          <UserPlus size={22} color={colors.primary} />
        </View>
      </View>

      <View style={styles.formCard}>
        {/* Full Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>TENANT FULL NAME</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Rohit Sharma"
            placeholderTextColor={colors.textMuted}
            value={name}
            onChangeText={setName}
          />
        </View>

        {/* Mobile Number */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>MOBILE NUMBER (FOR DIRECT UPI / ALERTS)</Text>
          <View style={styles.phoneRow}>
            <Text style={styles.prefix}>+91</Text>
            <TextInput
              style={styles.phoneInput}
              placeholder="98XXXXXXXX"
              placeholderTextColor={colors.textMuted}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              maxLength={10}
            />
          </View>
        </View>

        {/* Vacant Bed Selection */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>ASSIGN VACANT BED</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.bedScroll}>
            {vacantBeds.map((b) => {
              const isSelected = selectedBed === b.bedLabel;
              return (
                <TouchableOpacity
                  key={b.id}
                  style={[styles.bedPill, isSelected && styles.bedPillSelected]}
                  onPress={() => {
                    setSelectedBed(b.bedLabel);
                    setRent(b.rentAmount.toString());
                  }}
                >
                  <Text style={[styles.bedPillText, isSelected && styles.bedPillTextSelected]}>
                    Bed {b.bedLabel} (₹{b.rentAmount.toLocaleString()})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Rent & Deposit */}
        <View style={styles.twoColRow}>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>MONTHLY RENT</Text>
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              value={rent}
              onChangeText={setRent}
            />
          </View>

          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>SECURITY DEPOSIT</Text>
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              value={deposit}
              onChangeText={setDeposit}
            />
          </View>
        </View>

        {/* Pro-rata Rent Calculation Option */}
        <View style={styles.prorataBox}>
          <View style={styles.prorataHeader}>
            <Calendar size={16} color={colors.primary} />
            <Text style={styles.prorataTitle}>Pro-Rata Rent on Joining Date</Text>
          </View>
          <Text style={styles.prorataSub}>
            Joining on day of current month:
          </Text>

          <View style={styles.daySelectorRow}>
            {['1', '5', '10', '15', '20', '25'].map((d) => (
              <TouchableOpacity
                key={d}
                style={[styles.dayChip, joinDay === d && styles.dayChipActive]}
                onPress={() => setJoinDay(d)}
              >
                <Text style={[styles.dayChipText, joinDay === d && styles.dayChipTextActive]}>
                  {d}th
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {isProrated && (
            <View style={styles.prorataResult}>
              <Text style={styles.prorataResultLabel}>
                First Month Rent ({daysRemaining} days):
              </Text>
              <Text style={styles.prorataResultVal}>₹{proratedFirstRent.toLocaleString()}</Text>
            </View>
          )}
        </View>

        {/* Electricity Mode */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>ELECTRICITY BILLING</Text>
          <View style={styles.elecRow}>
            <TouchableOpacity
              style={[styles.elecOption, electricityType === 'metered' && styles.elecOptionSelected]}
              onPress={() => setElectricityType('metered')}
            >
              <Zap size={14} color={electricityType === 'metered' ? colors.textInverse : colors.textSecondary} />
              <Text style={[styles.elecText, electricityType === 'metered' && styles.elecTextSelected]}>
                Sub-Metered (Split)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.elecOption, electricityType === 'included' && styles.elecOptionSelected]}
              onPress={() => setElectricityType('included')}
            >
              <CheckCircle2 size={14} color={electricityType === 'included' ? colors.textInverse : colors.textSecondary} />
              <Text style={[styles.elecText, electricityType === 'included' && styles.elecTextSelected]}>
                Included in Flat Rent
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* KYC Document Checklist */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>KYC & DOCUMENTS</Text>
          <View style={styles.kycGrid}>
            <TouchableOpacity
              style={[styles.kycChip, idProof && styles.kycChipDone]}
              onPress={() => setIdProof(!idProof)}
            >
              <FileCheck size={14} color={idProof ? colors.success : colors.textMuted} />
              <Text style={[styles.kycText, idProof && styles.kycTextDone]}>ID Proof</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.kycChip, photo && styles.kycChipDone]}
              onPress={() => setPhoto(!photo)}
            >
              <FileCheck size={14} color={photo ? colors.success : colors.textMuted} />
              <Text style={[styles.kycText, photo && styles.kycTextDone]}>Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.kycChip, agreement && styles.kycChipDone]}
              onPress={() => setAgreement(!agreement)}
            >
              <FileCheck size={14} color={agreement ? colors.success : colors.textMuted} />
              <Text style={[styles.kycText, agreement && styles.kycTextDone]}>Agreement</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.kycChip, policeVerification && styles.kycChipDone]}
              onPress={() => setPoliceVerification(!policeVerification)}
            >
              <FileCheck size={14} color={policeVerification ? colors.success : colors.textMuted} />
              <Text style={[styles.kycText, policeVerification && styles.kycTextDone]}>Police Verif.</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bed occupancy indicator */}
        <View style={styles.statusIndicator}>
          <Text style={styles.statusText}>
            Bed <Text style={{ fontWeight: '800' }}>{selectedBed}</Text> will be marked{' '}
            <Text style={{ color: colors.primary, fontWeight: '800' }}>Occupied</Text>.
          </Text>
        </View>

        {/* Submit Button */}
        <TouchableOpacity style={styles.saveBtn} onPress={handleSaveTenant} activeOpacity={0.85}>
          <Text style={styles.saveBtnText}>Tenant Save Karo</Text>
          <ArrowRight size={18} color={colors.textInverse} />
        </TouchableOpacity>
      </View>
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
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 40,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  prefix: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    paddingRight: 8,
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  phoneInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  bedScroll: {
    flexDirection: 'row',
    marginTop: 4,
  },
  bedPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.surfaceSubtle,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
  },
  bedPillSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  bedPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  bedPillTextSelected: {
    color: colors.textInverse,
    fontWeight: '700',
  },
  twoColRow: {
    flexDirection: 'row',
    gap: 12,
  },
  prorataBox: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  prorataHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  prorataTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  prorataSub: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  daySelectorRow: {
    flexDirection: 'row',
    gap: 6,
  },
  dayChip: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dayChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dayChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  dayChipTextActive: {
    color: colors.textInverse,
    fontWeight: '700',
  },
  prorataResult: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  prorataResultLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  prorataResultVal: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.primary,
  },
  elecRow: {
    flexDirection: 'row',
    gap: 8,
  },
  elecOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    backgroundColor: colors.surfaceSubtle,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  elecOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  elecText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  elecTextSelected: {
    color: colors.textInverse,
    fontWeight: '700',
  },
  kycGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  kycChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: colors.surfaceSubtle,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  kycChipDone: {
    borderColor: colors.successBorder,
    backgroundColor: colors.successLight,
  },
  kycText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  kycTextDone: {
    color: colors.success,
    fontWeight: '700',
  },
  statusIndicator: {
    padding: 10,
    backgroundColor: colors.surfaceSubtle,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  statusText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  saveBtn: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 10,
  },
  saveBtnText: {
    color: colors.textInverse,
    fontSize: 14,
    fontWeight: '700',
  },
});
