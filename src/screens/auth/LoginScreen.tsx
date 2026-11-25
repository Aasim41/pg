import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import { useApp } from '../../context/AppContext';
import { colors } from '../../theme/colors';
import { Role } from '../../types';
import { Building2, ArrowRight, ShieldCheck } from 'lucide-react-native';

export const LoginScreen: React.FC = () => {
  const { login } = useApp();
  const [phone, setPhone] = useState('9876543210');
  const [otp, setOtp] = useState(['3', '8', '1', '6']);
  const [selectedRole, setSelectedRole] = useState<Role>('tenant');

  const handleLogin = () => {
    login(phone, selectedRole);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.content}>
          {/* Brand Logo & Header */}
          <View style={styles.header}>
            <View style={styles.logoBadge}>
              <Building2 size={32} color={colors.primary} />
            </View>
            <Text style={styles.title}>Aapka PG</Text>
            <Text style={styles.subtitle}>Sign in with your mobile number</Text>
          </View>

          {/* Login Card */}
          <View style={styles.card}>
            {/* Mobile Number Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>MOBILE NUMBER</Text>
              <View style={styles.phoneInputContainer}>
                <Text style={styles.countryCode}>+91</Text>
                <TextInput
                  style={styles.phoneInput}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="Enter 10-digit number"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="phone-pad"
                  maxLength={10}
                />
              </View>
            </View>

            {/* OTP Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>ENTER OTP</Text>
              <View style={styles.otpContainer}>
                {otp.map((digit, idx) => (
                  <TextInput
                    key={idx}
                    style={styles.otpBox}
                    value={digit}
                    onChangeText={(val) => {
                      const newOtp = [...otp];
                      newOtp[idx] = val;
                      setOtp(newOtp);
                    }}
                    keyboardType="number-pad"
                    maxLength={1}
                  />
                ))}
              </View>
            </View>

            {/* Role Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>AAP KAUN HO? (YOUR ROLE)</Text>
              <View style={styles.roleGrid}>
                {(['tenant', 'manager', 'malik'] as Role[]).map((r) => {
                  const isSelected = selectedRole === r;
                  const label = r === 'tenant' ? 'Tenant' : r === 'manager' ? 'Manager' : 'Malik';
                  return (
                    <TouchableOpacity
                      key={r}
                      style={[styles.roleOption, isSelected && styles.roleOptionSelected]}
                      onPress={() => setSelectedRole(r)}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.roleOptionText,
                          isSelected && styles.roleOptionTextSelected,
                        ]}
                      >
                        {label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Login Button */}
            <TouchableOpacity style={styles.loginButton} onPress={handleLogin} activeOpacity={0.85}>
              <Text style={styles.loginButtonText}>Login</Text>
              <ArrowRight size={18} color={colors.textInverse} />
            </TouchableOpacity>

            {/* Security note */}
            <View style={styles.footerNote}>
              <ShieldCheck size={14} color={colors.textMuted} />
              <Text style={styles.footerNoteText}>
                Har kisi ko sirf apna kaam dikhega (Role-secured)
              </Text>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  content: {
    maxWidth: 420,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoBadge: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  inputGroup: {
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: 10,
    backgroundColor: colors.surfaceSubtle,
    paddingHorizontal: 12,
  },
  countryCode: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    paddingRight: 10,
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  phoneInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  otpBox: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: 10,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    backgroundColor: colors.surfaceSubtle,
  },
  roleGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  roleOption: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
  },
  roleOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  roleOptionText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  roleOptionTextSelected: {
    color: colors.textInverse,
    fontWeight: '700',
  },
  loginButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    gap: 8,
    marginTop: 8,
  },
  loginButtonText: {
    color: colors.textInverse,
    fontSize: 15,
    fontWeight: '700',
  },
  footerNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 18,
  },
  footerNoteText: {
    fontSize: 11,
    color: colors.textMuted,
  },
});
