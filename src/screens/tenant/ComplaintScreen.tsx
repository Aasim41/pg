import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { colors } from '../../theme/colors';
import { useApp } from '../../context/AppContext';
import { ComplaintCategory } from '../../types';
import {
  MessageSquareWarning,
  Plus,
  CheckCircle2,
  Clock,
  Eye,
  X,
  AirVent,
  Wifi,
  Droplets,
  Sparkles,
  Lock,
} from 'lucide-react-native';

export const ComplaintScreen: React.FC = () => {
  const { complaints, currentTenant, addComplaint } = useApp();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ComplaintCategory>('AC');
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');

  const tenantComplaints = complaints.filter((c) => c.tenantId === currentTenant.id);

  const categories: { label: string; id: ComplaintCategory; icon: any }[] = [
    { id: 'AC', label: 'AC', icon: AirVent },
    { id: 'WiFi', label: 'WiFi', icon: Wifi },
    { id: 'Water', label: 'Paani', icon: Droplets },
    { id: 'Cleaning', label: 'Safai', icon: Sparkles },
    { id: 'Lock', label: 'Lock', icon: Lock },
  ];

  const handleSubmit = () => {
    if (!title.trim()) {
      Alert.alert('Required', 'Please enter a short title for your complaint.');
      return;
    }
    addComplaint(selectedCategory, title.trim(), desc.trim());
    setTitle('');
    setDesc('');
    setModalVisible(false);
    Alert.alert('Complaint Sent!', 'Your manager has been notified and will review it shortly.');
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.subTitle}>ISSUE RESOLUTION</Text>
          <Text style={styles.title}>Complaints & Requests</Text>
        </View>
        <TouchableOpacity
          style={styles.newBtn}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.8}
        >
          <Plus size={16} color={colors.textInverse} />
          <Text style={styles.newBtnText}>Complaint Bhejo</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Category Quick-Select bar */}
      <View style={styles.categoryRow}>
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <TouchableOpacity
              key={cat.id}
              style={styles.catPill}
              onPress={() => {
                setSelectedCategory(cat.id);
                setModalVisible(true);
              }}
            >
              <Icon size={16} color={colors.textSecondary} />
              <Text style={styles.catPillText}>{cat.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Complaints List */}
      <View style={styles.listSection}>
        <Text style={styles.listSectionTitle}>YOUR ACTIVE & PAST TICKETS</Text>

        {tenantComplaints.length > 0 ? (
          tenantComplaints.map((c) => {
            const isSubmitted = c.status === 'submitted';
            const isViewed = c.status === 'viewed';
            const isResolved = c.status === 'resolved';

            return (
              <View key={c.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.catTag}>
                    <Text style={styles.catTagText}>{c.category}</Text>
                  </View>
                  <Text style={styles.createdAtText}>{c.createdAt}</Text>
                </View>

                <Text style={styles.cardTitle}>{c.title}</Text>
                {c.description ? <Text style={styles.cardDesc}>{c.description}</Text> : null}

                {/* 3-Stage Stepper Tracker */}
                <View style={styles.trackerContainer}>
                  {/* Step 1: Submitted */}
                  <View style={styles.trackerStep}>
                    <View style={[styles.stepDot, styles.stepDotDone]}>
                      <CheckCircle2 size={12} color={colors.textInverse} />
                    </View>
                    <Text style={[styles.stepText, styles.stepTextDone]}>Complaint gayi</Text>
                  </View>

                  <View style={[styles.stepLine, (isViewed || isResolved) && styles.stepLineDone]} />

                  {/* Step 2: Viewed */}
                  <View style={styles.trackerStep}>
                    <View
                      style={[
                        styles.stepDot,
                        (isViewed || isResolved) && styles.stepDotDone,
                        isSubmitted && styles.stepDotPending,
                      ]}
                    >
                      {isViewed || isResolved ? (
                        <CheckCircle2 size={12} color={colors.textInverse} />
                      ) : (
                        <Clock size={12} color={colors.textMuted} />
                      )}
                    </View>
                    <Text
                      style={[
                        styles.stepText,
                        (isViewed || isResolved) && styles.stepTextDone,
                      ]}
                    >
                      Manager ne dekha
                    </Text>
                  </View>

                  <View style={[styles.stepLine, isResolved && styles.stepLineDone]} />

                  {/* Step 3: Resolved */}
                  <View style={styles.trackerStep}>
                    <View
                      style={[
                        styles.stepDot,
                        isResolved && styles.stepDotDone,
                        !isResolved && styles.stepDotPending,
                      ]}
                    >
                      {isResolved ? (
                        <CheckCircle2 size={12} color={colors.textInverse} />
                      ) : (
                        <Clock size={12} color={colors.textMuted} />
                      )}
                    </View>
                    <Text style={[styles.stepText, isResolved && styles.stepTextDone]}>
                      Theek ho gaya
                    </Text>
                  </View>
                </View>
              </View>
            );
          })
        ) : (
          <View style={styles.emptyCard}>
            <CheckCircle2 size={32} color={colors.success} />
            <Text style={styles.emptyTitle}>No Open Complaints</Text>
            <Text style={styles.emptySub}>
              Everything in Room {currentTenant.roomNumber} is running smoothly!
            </Text>
          </View>
        )}
      </View>

      {/* New Complaint Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>File a Complaint</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Category Selector */}
            <Text style={styles.modalLabel}>SELECT CATEGORY</Text>
            <View style={styles.modalCatRow}>
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.modalCatPill, isSelected && styles.modalCatPillSelected]}
                    onPress={() => setSelectedCategory(cat.id)}
                  >
                    <Text
                      style={[
                        styles.modalCatText,
                        isSelected && styles.modalCatTextSelected,
                      ]}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.modalLabel}>ISSUE TITLE</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. AC thanda nahi kar raha"
              placeholderTextColor={colors.textMuted}
              value={title}
              onChangeText={setTitle}
            />

            <Text style={styles.modalLabel}>DESCRIPTION / DETAILS</Text>
            <TextInput
              style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
              placeholder="Explain the problem in detail..."
              placeholderTextColor={colors.textMuted}
              multiline
              value={desc}
              onChangeText={setDesc}
            />

            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
              <Text style={styles.submitBtnText}>Submit Complaint (Manager ko Bhejo)</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  newBtn: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  newBtnText: {
    color: colors.textInverse,
    fontSize: 12,
    fontWeight: '700',
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  catPill: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    flex: 1,
    marginHorizontal: 3,
    gap: 4,
  },
  catPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  listSection: {
    marginBottom: 40,
  },
  listSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  catTag: {
    backgroundColor: colors.surfaceSubtle,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  catTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  createdAtText: {
    fontSize: 11,
    color: colors.textMuted,
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
    marginBottom: 14,
  },
  trackerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
  },
  trackerStep: {
    alignItems: 'center',
    flex: 1,
  },
  stepDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  stepDotDone: {
    backgroundColor: colors.success,
  },
  stepDotPending: {
    backgroundColor: colors.surfaceMuted,
  },
  stepLine: {
    height: 2,
    flex: 0.6,
    backgroundColor: colors.borderStrong,
    marginBottom: 16,
  },
  stepLineDone: {
    backgroundColor: colors.success,
  },
  stepText: {
    fontSize: 9,
    fontWeight: '600',
    color: colors.textMuted,
    textAlign: 'center',
  },
  stepTextDone: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  emptyCard: {
    backgroundColor: colors.surface,
    padding: 30,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 10,
  },
  emptySub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 36,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  modalLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.6,
    marginBottom: 8,
    marginTop: 12,
  },
  modalCatRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  modalCatPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: colors.surfaceSubtle,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalCatPillSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  modalCatText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  modalCatTextSelected: {
    color: colors.textInverse,
    fontWeight: '700',
  },
  input: {
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.textPrimary,
  },
  submitBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  submitBtnText: {
    color: colors.textInverse,
    fontSize: 14,
    fontWeight: '700',
  },
});
