import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { colors } from '../../theme/colors';
import { useApp } from '../../context/AppContext';
import { ComplaintStatus } from '../../types';
import {
  MessageSquareWarning,
  CheckCircle2,
  Clock,
  Eye,
  Check,
} from 'lucide-react-native';

export const ComplaintListScreen: React.FC = () => {
  const { complaints, updateComplaintStatus } = useApp();
  const [filter, setFilter] = useState<'all' | 'submitted' | 'viewed' | 'resolved'>('all');

  const countNew = complaints.filter((c) => c.status === 'submitted').length;
  const countInProgress = complaints.filter((c) => c.status === 'viewed').length;
  const countDone = complaints.filter((c) => c.status === 'resolved').length;

  const filteredComplaints = complaints.filter((c) => {
    if (filter === 'all') return true;
    return c.status === filter;
  });

  const handleStatusChange = (id: string, newStatus: ComplaintStatus, roomNo: string) => {
    updateComplaintStatus(id, newStatus);
    const msg =
      newStatus === 'viewed'
        ? `Room ${roomNo} ko update gaya: 'Manager ne complaint dekh li'`
        : `Room ${roomNo} ko update gaya: 'Complaint theek ho gayi ✓'`;
    Alert.alert('Status Updated', msg);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.subTitle}>OPERATIONS</Text>
          <Text style={styles.title}>Complaints Tracker</Text>
        </View>
        <View style={styles.iconBox}>
          <MessageSquareWarning size={22} color={colors.primary} />
        </View>
      </View>

      {/* Summary Filter Pills (Naye, Chalu, Done) */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterPill, filter === 'all' && styles.filterPillActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterPillText, filter === 'all' && styles.filterPillTextActive]}>
            Sabhi ({complaints.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterPill, filter === 'submitted' && styles.filterPillActive]}
          onPress={() => setFilter('submitted')}
        >
          <Text style={[styles.filterPillText, filter === 'submitted' && styles.filterPillTextActive]}>
            Naye ({countNew})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterPill, filter === 'viewed' && styles.filterPillActive]}
          onPress={() => setFilter('viewed')}
        >
          <Text style={[styles.filterPillText, filter === 'viewed' && styles.filterPillTextActive]}>
            Chalu ({countInProgress})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterPill, filter === 'resolved' && styles.filterPillActive]}
          onPress={() => setFilter('resolved')}
        >
          <Text style={[styles.filterPillText, filter === 'resolved' && styles.filterPillTextActive]}>
            Done ({countDone})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Complaints List */}
      <View style={styles.listSection}>
        {filteredComplaints.map((item) => {
          const isSubmitted = item.status === 'submitted';
          const isViewed = item.status === 'viewed';
          const isResolved = item.status === 'resolved';

          return (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.roomTag}>
                  <Text style={styles.roomTagText}>Room {item.roomNumber}</Text>
                  <Text style={styles.tenantNameText}>• {item.tenantName}</Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    isResolved && styles.statusBadgeDone,
                    isViewed && styles.statusBadgeViewed,
                    isSubmitted && styles.statusBadgeNew,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusBadgeText,
                      isResolved && { color: colors.success },
                      isViewed && { color: colors.warning },
                      isSubmitted && { color: colors.danger },
                    ]}
                  >
                    {isResolved ? 'Done' : isViewed ? 'Chalu' : 'Naya'}
                  </Text>
                </View>
              </View>

              <Text style={styles.cardTitle}>{item.title}</Text>
              {item.description ? <Text style={styles.cardDesc}>{item.description}</Text> : null}
              <Text style={styles.timeText}>Raised: {item.createdAt}</Text>

              {/* Status Action Buttons */}
              <View style={styles.actionRow}>
                {isSubmitted && (
                  <TouchableOpacity
                    style={styles.viewedBtn}
                    onPress={() => handleStatusChange(item.id, 'viewed', item.roomNumber)}
                  >
                    <Eye size={14} color={colors.primary} />
                    <Text style={styles.viewedBtnText}>Mark Dekha (In Progress)</Text>
                  </TouchableOpacity>
                )}

                {!isResolved && (
                  <TouchableOpacity
                    style={styles.resolveBtn}
                    onPress={() => handleStatusChange(item.id, 'resolved', item.roomNumber)}
                  >
                    <CheckCircle2 size={14} color={colors.textInverse} />
                    <Text style={styles.resolveBtnText}>Mark Theek Ho Gaya (Done)</Text>
                  </TouchableOpacity>
                )}

                {isResolved && (
                  <View style={styles.resolvedInfo}>
                    <Check size={14} color={colors.success} />
                    <Text style={styles.resolvedInfoText}>Resolved on {item.resolvedAt || 'Today'}</Text>
                  </View>
                )}
              </View>
            </View>
          );
        })}
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
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  filterPill: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  filterPillTextActive: {
    color: colors.textInverse,
    fontWeight: '700',
  },
  listSection: {
    gap: 12,
    marginBottom: 40,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  roomTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  roomTagText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  tenantNameText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusBadgeNew: {
    backgroundColor: colors.dangerLight,
    borderColor: colors.dangerBorder,
  },
  statusBadgeViewed: {
    backgroundColor: colors.warningLight,
    borderColor: colors.warningBorder,
  },
  statusBadgeDone: {
    backgroundColor: colors.successLight,
    borderColor: colors.successBorder,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 8,
  },
  timeText: {
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 12,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  viewedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  viewedBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  resolveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.success,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  resolveBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textInverse,
  },
  resolvedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  resolvedInfoText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.success,
  },
});
