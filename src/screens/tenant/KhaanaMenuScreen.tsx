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
import {
  UtensilsCrossed,
  Sunrise,
  Sun,
  Moon,
  Star,
  Check,
} from 'lucide-react-native';

export const KhaanaMenuScreen: React.FC = () => {
  const { meals } = useApp();
  const [selectedDayIdx, setSelectedDayIdx] = useState(2); // Wednesday (default)
  const [rating, setRating] = useState<number>(5);
  const [rated, setRated] = useState(false);

  const selectedMeal = meals[selectedDayIdx] || meals[0];

  const handleRate = (star: number) => {
    setRating(star);
    setRated(true);
    setTimeout(() => {
      Alert.alert('Feedback Recorded', `Thank you for rating today's meals ${star} stars!`);
    }, 200);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.subTitle}>MESS & DINING</Text>
          <Text style={styles.title}>Khaane Ka Menu</Text>
        </View>
        <View style={styles.iconBox}>
          <UtensilsCrossed size={20} color={colors.textPrimary} />
        </View>
      </View>

      {/* Weekday Selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.dayScroll}
        contentContainerStyle={styles.dayScrollContent}
      >
        {meals.map((m, idx) => {
          const isSelected = selectedDayIdx === idx;
          return (
            <TouchableOpacity
              key={m.day}
              style={[styles.dayCard, isSelected && styles.dayCardSelected]}
              onPress={() => setSelectedDayIdx(idx)}
              activeOpacity={0.7}
            >
              <Text style={[styles.dayName, isSelected && styles.dayNameSelected]}>
                {m.day.slice(0, 3)}
              </Text>
              <Text style={[styles.dateStr, isSelected && styles.dateStrSelected]}>
                {m.dateStr.split(' ')[1]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Meals Breakdown for the selected day */}
      <View style={styles.menuSection}>
        <Text style={styles.dayTitle}>
          {selectedMeal.day} • {selectedMeal.dateStr}
        </Text>

        {/* 1. Breakfast */}
        <View style={styles.mealCard}>
          <View style={styles.mealCardHeader}>
            <View style={styles.mealTitleRow}>
              <Sunrise size={18} color={colors.warning} />
              <Text style={styles.mealTitle}>Nashta (Breakfast)</Text>
            </View>
            <Text style={styles.mealTimings}>{selectedMeal.timings.breakfast}</Text>
          </View>
          <Text style={styles.mealItems}>{selectedMeal.breakfast}</Text>
        </View>

        {/* 2. Lunch */}
        <View style={styles.mealCard}>
          <View style={styles.mealCardHeader}>
            <View style={styles.mealTitleRow}>
              <Sun size={18} color={colors.warning} />
              <Text style={styles.mealTitle}>Lunch (Dopahar ka Khana)</Text>
            </View>
            <Text style={styles.mealTimings}>{selectedMeal.timings.lunch}</Text>
          </View>
          <Text style={styles.mealItems}>{selectedMeal.lunch}</Text>
        </View>

        {/* 3. Dinner */}
        <View style={styles.mealCard}>
          <View style={styles.mealCardHeader}>
            <View style={styles.mealTitleRow}>
              <Moon size={18} color={colors.info} />
              <Text style={styles.mealTitle}>Dinner (Raat ka Khana)</Text>
            </View>
            <Text style={styles.mealTimings}>{selectedMeal.timings.dinner}</Text>
          </View>
          <Text style={styles.mealItems}>{selectedMeal.dinner}</Text>
        </View>
      </View>

      {/* Feedback Widget */}
      <View style={styles.feedbackCard}>
        <Text style={styles.feedbackTitle}>Kaisa Laga Khana?</Text>
        <Text style={styles.feedbackSub}>Rate today's taste & quality</Text>
        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity key={star} onPress={() => handleRate(star)} style={styles.starBtn}>
              <Star
                size={28}
                color={star <= rating ? colors.warning : colors.borderStrong}
                fill={star <= rating ? colors.warning : 'transparent'}
              />
            </TouchableOpacity>
          ))}
        </View>
        {rated && (
          <View style={styles.thankYouBadge}>
            <Check size={14} color={colors.success} />
            <Text style={styles.thankYouText}>Rating Saved!</Text>
          </View>
        )}
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
  dayScroll: {
    marginBottom: 16,
  },
  dayScrollContent: {
    gap: 8,
  },
  dayCard: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  dayCardSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dayName: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  dayNameSelected: {
    color: colors.textInverse,
  },
  dateStr: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 2,
  },
  dateStrSelected: {
    color: colors.textInverse,
  },
  menuSection: {
    gap: 12,
    marginBottom: 20,
  },
  dayTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  mealCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  mealCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mealTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mealTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  mealTimings: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
  },
  mealItems: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  feedbackCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    marginBottom: 40,
  },
  feedbackTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  feedbackSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: 12,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  starBtn: {
    padding: 4,
  },
  thankYouBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 12,
    backgroundColor: colors.successLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  thankYouText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.success,
  },
});
