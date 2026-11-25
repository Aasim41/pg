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
import {
  Gauge,
  Send,
  CheckCircle2,
  AlertCircle,
  Camera,
  Info,
} from 'lucide-react-native';

export const MeterReadingScreen: React.FC = () => {
  const { rooms, updateRoomMeter, batchSendElectricityBills, ownerSettings } = useApp();
  const [readings, setReadings] = useState<{ [room: string]: string }>(() => {
    const map: { [room: string]: string } = {};
    rooms.forEach((r) => {
      map[r.roomNumber] = r.currentReading.toString();
    });
    return map;
  });

  const handleReadingChange = (roomNumber: string, value: string) => {
    setReadings((prev) => ({ ...prev, [roomNumber]: value }));
    const parsed = parseInt(value, 10);
    if (!isNaN(parsed)) {
      updateRoomMeter(roomNumber, parsed);
    }
  };

  const handleBatchSend = () => {
    batchSendElectricityBills();
    Alert.alert(
      'Bills Dispatched! ✓',
      'Electricity calculations and updated invoices have been sent to all tenants with their individual share.'
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.subTitle}>MONTHLY CONSUMPTION</Text>
          <Text style={styles.title}>Meter Reading Entry</Text>
        </View>
        <View style={styles.iconBox}>
          <Gauge size={22} color={colors.primary} />
        </View>
      </View>

      {/* Auto Calculation Banner */}
      <View style={styles.rateBanner}>
        <View style={{ flex: 1 }}>
          <Text style={styles.rateBannerTitle}>
            Hisaab Apne Aap: ₹{ownerSettings.ratePerUnit} / unit
          </Text>
          <Text style={styles.rateBannerSub}>
            Enter current numbers; the app calculates units and splits between roommates automatically.
          </Text>
        </View>
      </View>

      {/* Room Table */}
      <View style={styles.tableCard}>
        <View style={styles.tableHeader}>
          <Text style={[styles.thText, { flex: 1 }]}>ROOM</Text>
          <Text style={[styles.thText, { flex: 1.2, textAlign: 'center' }]}>PREV</Text>
          <Text style={[styles.thText, { flex: 1.5, textAlign: 'center' }]}>CURRENT</Text>
          <Text style={[styles.thText, { flex: 1.2, textAlign: 'right' }]}>BILL</Text>
        </View>

        {rooms.map((room) => {
          const isIncluded = room.electricityType === 'included';
          const prev = room.previousReading;
          const current = parseInt(readings[room.roomNumber] || '0', 10);
          const units = Math.max(0, current - prev);
          const billAmount = units * room.ratePerUnit;

          return (
            <View key={room.roomNumber} style={styles.tableRow}>
              {/* Room Number */}
              <View style={{ flex: 1 }}>
                <Text style={styles.roomNo}>Room {room.roomNumber}</Text>
                <Text style={styles.roomType}>
                  {isIncluded ? 'Flat Rent' : 'Sub-meter'}
                </Text>
              </View>

              {isIncluded ? (
                // Electricity Included
                <View style={styles.includedRowContent}>
                  <Text style={styles.includedNoticeText}>Included in Rent (No meter needed)</Text>
                </View>
              ) : (
                // Metered Room Inputs
                <>
                  {/* Previous Reading */}
                  <View style={{ flex: 1.2, alignItems: 'center' }}>
                    <Text style={styles.prevText}>{prev.toLocaleString()}</Text>
                  </View>

                  {/* Current Reading Input */}
                  <View style={{ flex: 1.5, alignItems: 'center' }}>
                    <TextInput
                      style={styles.currentInput}
                      keyboardType="number-pad"
                      value={readings[room.roomNumber] || ''}
                      onChangeText={(val) => handleReadingChange(room.roomNumber, val)}
                    />
                  </View>

                  {/* Calculated Bill */}
                  <View style={{ flex: 1.2, alignItems: 'flex-end' }}>
                    <Text style={styles.billText}>₹{billAmount.toLocaleString()}</Text>
                    <Text style={styles.unitsSub}>{units} units</Text>
                  </View>
                </>
              )}
            </View>
          );
        })}
      </View>

      {/* Dispatch Button */}
      <TouchableOpacity style={styles.sendAllBtn} onPress={handleBatchSend} activeOpacity={0.85}>
        <Send size={18} color={colors.textInverse} />
        <Text style={styles.sendAllBtnText}>Sabko Bill Bhejo + (Batch Dispatch)</Text>
      </TouchableOpacity>

      <View style={styles.noteBox}>
        <Info size={14} color={colors.textMuted} />
        <Text style={styles.noteText}>
          Tapping 'Sabko Bill Bhejo' generates verified electricity slips for all tenants and bundles them into their monthly rent dues.
        </Text>
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
  rateBanner: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  rateBannerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  rateBannerSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  tableCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceSubtle,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  thText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 0.6,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  roomNo: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  roomType: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1,
  },
  prevText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  currentInput: {
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    width: 80,
  },
  billText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  unitsSub: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 1,
  },
  includedRowContent: {
    flex: 3.9,
    alignItems: 'center',
    paddingVertical: 6,
  },
  includedNoticeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.success,
  },
  sendAllBtn: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 10,
    marginBottom: 12,
  },
  sendAllBtnText: {
    color: colors.textInverse,
    fontSize: 14,
    fontWeight: '700',
  },
  noteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 40,
  },
  noteText: {
    fontSize: 11,
    color: colors.textMuted,
    flex: 1,
    lineHeight: 16,
  },
});
