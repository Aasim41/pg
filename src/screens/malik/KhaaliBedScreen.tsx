import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  Alert,
} from 'react-native';
import { colors } from '../../theme/colors';
import { useApp } from '../../context/AppContext';
import { Bed } from '../../types';
import {
  LayoutGrid,
  Share2,
  CheckCircle2,
  Clock,
  Sparkles,
  Info,
} from 'lucide-react-native';

export const KhaaliBedScreen: React.FC = () => {
  const { beds, ownerSettings } = useApp();

  const occupiedCount = beds.filter((b) => b.status === 'occupied').length;
  const vacantCount = beds.filter((b) => b.status === 'vacant').length;
  const noticeCount = beds.filter((b) => b.status === 'notice').length;

  const [selectedBed, setSelectedBed] = useState<Bed | null>(
    beds.find((b) => b.status === 'vacant') || null
  );

  const handleShareVacantBeds = async () => {
    const vacantList = beds
      .filter((b) => b.status === 'vacant')
      .map((b) => `• Bed ${b.bedLabel} (Room ${b.roomNumber}) - ₹${b.rentAmount.toLocaleString()}/month`)
      .join('\n');

    const shareMessage = `🏠 Vacant Beds Available at ${ownerSettings.pgName}!\n\n${vacantList}\n\n✨ Amenities:\n• High Speed WiFi\n• Clean Mess Food (3 Meals)\n• 24x7 Water & Geyser\n• Direct UPI / Cash payments (No extra app fees)\n\n📍 Address: ${ownerSettings.address}\n📞 Call/WhatsApp: ${ownerSettings.phone}\nBook your bed today!`;

    try {
      await Share.share({
        message: shareMessage,
        title: 'Aapka PG - Vacant Beds',
      });
    } catch {
      Alert.alert('Notice', 'Marketing message ready to share.');
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.subTitle}>OCCUPANCY & LEADS</Text>
          <Text style={styles.title}>Khaali Bed (Bed Matrix)</Text>
          <Text style={styles.liveSubtitle}>Live - Har room ka haal</Text>
        </View>
        <View style={styles.iconBox}>
          <LayoutGrid size={22} color={colors.primary} />
        </View>
      </View>

      {/* 3 Status Counters */}
      <View style={styles.counterRow}>
        <View style={styles.counterCard}>
          <Text style={styles.counterNumber}>{occupiedCount}</Text>
          <Text style={styles.counterLabel}>Bhare (Occupied)</Text>
        </View>

        <View style={[styles.counterCard, { borderColor: colors.successBorder, backgroundColor: colors.successLight }]}>
          <Text style={[styles.counterNumber, { color: colors.success }]}>{vacantCount}</Text>
          <Text style={[styles.counterLabel, { color: colors.success, fontWeight: '700' }]}>
            Khaali (Vacant)
          </Text>
        </View>

        <View style={[styles.counterCard, { borderColor: colors.warningBorder, backgroundColor: colors.warningLight }]}>
          <Text style={[styles.counterNumber, { color: colors.warning }]}>{noticeCount}</Text>
          <Text style={[styles.counterLabel, { color: colors.warning }]}>Notice</Text>
        </View>
      </View>

      {/* Visual Bed Grid (40 Beds) */}
      <View style={styles.gridCard}>
        <Text style={styles.gridTitle}>40-BED VISUAL MATRIX</Text>
        <View style={styles.matrixContainer}>
          {beds.map((bed) => {
            const isVacant = bed.status === 'vacant';
            const isNotice = bed.status === 'notice';
            const isOccupied = bed.status === 'occupied';
            const isSelected = selectedBed?.id === bed.id;

            return (
              <TouchableOpacity
                key={bed.id}
                style={[
                  styles.bedTile,
                  isVacant && styles.bedTileVacant,
                  isNotice && styles.bedTileNotice,
                  isSelected && styles.bedTileSelected,
                ]}
                onPress={() => setSelectedBed(bed)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.bedTileText,
                    isVacant && styles.bedTileTextVacant,
                    isNotice && styles.bedTileTextNotice,
                    isSelected && styles.bedTileTextSelected,
                  ]}
                >
                  {bed.bedLabel}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Legend */}
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.surfaceMuted }]} />
            <Text style={styles.legendText}>Occupied</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
            <Text style={styles.legendText}>Vacant (Khaali)</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.warning }]} />
            <Text style={styles.legendText}>On Notice</Text>
          </View>
        </View>
      </View>

      {/* Selected Bed Details Card */}
      {selectedBed && (
        <View style={styles.selectedBedCard}>
          <View style={styles.selectedBedHeader}>
            <View>
              <Text style={styles.selectedBedTitle}>Bed {selectedBed.bedLabel}</Text>
              <Text style={styles.selectedBedSub}>
                Room {selectedBed.roomNumber} • Status:{' '}
                <Text style={{ fontWeight: '800', textTransform: 'capitalize' }}>
                  {selectedBed.status}
                </Text>
              </Text>
            </View>
            <Text style={styles.selectedBedRent}>
              ₹{selectedBed.rentAmount.toLocaleString()} / mo
            </Text>
          </View>

          {selectedBed.tenantName && (
            <Text style={styles.tenantOccupant}>Current Tenant: {selectedBed.tenantName}</Text>
          )}

          {selectedBed.noticeEndDate && (
            <Text style={styles.noticeDate}>
              Notice Ending: {selectedBed.noticeEndDate} (Will become vacant)
            </Text>
          )}
        </View>
      )}

      {/* Marketing Action: Share Vacant Beds Link */}
      <TouchableOpacity
        style={styles.shareBtn}
        onPress={handleShareVacantBeds}
        activeOpacity={0.85}
      >
        <Share2 size={18} color={colors.textInverse} />
        <Text style={styles.shareBtnText}>
          Khaali Bed Ka Link Share Karo ({vacantCount} Beds Available)
        </Text>
      </TouchableOpacity>

      <View style={styles.infoBox}>
        <Info size={14} color={colors.textMuted} />
        <Text style={styles.infoText}>
          One-tap marketing: Shares bed numbers, room pricing, and PG contact details straight to your WhatsApp status or prospective tenants.
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
  liveSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
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
  counterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  counterCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  counterNumber: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.textPrimary,
  },
  counterLabel: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  gridCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  gridTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  matrixContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'space-between',
  },
  bedTile: {
    width: '23%',
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bedTileVacant: {
    backgroundColor: colors.successLight,
    borderColor: colors.success,
    borderWidth: 1.5,
  },
  bedTileNotice: {
    backgroundColor: colors.warningLight,
    borderColor: colors.warning,
    borderWidth: 1.5,
  },
  bedTileSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  bedTileText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  bedTileTextVacant: {
    color: colors.success,
    fontWeight: '800',
  },
  bedTileTextNotice: {
    color: colors.warning,
    fontWeight: '800',
  },
  bedTileTextSelected: {
    color: colors.textInverse,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  selectedBedCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  selectedBedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedBedTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  selectedBedSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  selectedBedRent: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.primary,
  },
  tenantOccupant: {
    fontSize: 12,
    color: colors.textPrimary,
    fontWeight: '600',
    marginTop: 8,
  },
  noticeDate: {
    fontSize: 11,
    color: colors.warning,
    fontWeight: '600',
    marginTop: 4,
  },
  shareBtn: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 10,
    marginBottom: 12,
  },
  shareBtnText: {
    color: colors.textInverse,
    fontSize: 14,
    fontWeight: '700',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 40,
  },
  infoText: {
    fontSize: 11,
    color: colors.textMuted,
    flex: 1,
    lineHeight: 16,
  },
});
