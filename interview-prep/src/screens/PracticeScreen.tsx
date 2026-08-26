import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { radius, spacing, useTheme } from '../theme';
import { Button, Card, ConfidencePicker, Pill } from '../components/ui';
import {
  categoryById,
  questionsForCategory,
} from '../data/questions';
import {
  Confidence,
  loadProgress,
  Progress,
  saveConfidence,
} from '../storage';
import type { StackProps } from '../navigation';

export default function PracticeScreen({ route, navigation }: StackProps<'Practice'>) {
  const theme = useTheme();
  const { categoryId } = route.params;
  const category = categoryById(categoryId);
  const qs = questionsForCategory(categoryId);

  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [progress, setProgress] = useState<Progress>({});

  useEffect(() => {
    navigation.setOptions({ title: category?.title ?? 'Practice' });
  }, [navigation, category]);

  useEffect(() => {
    loadProgress().then(setProgress);
  }, []);

  const current = qs[index];

  const goNext = useCallback(() => {
    setRevealed(false);
    setIndex((i) => Math.min(i + 1, qs.length - 1));
  }, [qs.length]);

  const goPrev = useCallback(() => {
    setRevealed(false);
    setIndex((i) => Math.max(i - 1, 0));
  }, []);

  const rate = useCallback(
    async (value: Confidence) => {
      if (!current) return;
      const next = await saveConfidence(current.id, value);
      setProgress(next);
      // brief pause feel: advance if not the last card
      if (index < qs.length - 1) {
        setTimeout(goNext, 250);
      }
    },
    [current, goNext, index, qs.length],
  );

  if (!category || qs.length === 0 || !current) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg, padding: spacing.lg }}>
        <Text style={{ color: theme.text }}>No questions found for this topic.</Text>
      </SafeAreaView>
    );
  }

  const currentConfidence = (progress[current.id] ?? 0) as Confidence;
  const pct = Math.round(((index + 1) / qs.length) * 100);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['bottom']}>
      {/* Progress bar */}
      <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.md }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm }}>
          <Text style={{ color: theme.textMuted, fontWeight: '700', fontSize: 13 }}>
            Question {index + 1} of {qs.length}
          </Text>
          <Text style={{ color: category.accent, fontWeight: '700', fontSize: 13 }}>
            {category.emoji} {category.title}
          </Text>
        </View>
        <View
          style={{
            height: 6,
            borderRadius: 999,
            backgroundColor: theme.cardAlt,
            overflow: 'hidden',
          }}
        >
          <View style={{ width: `${pct}%`, height: '100%', backgroundColor: category.accent }} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, flexGrow: 1, justifyContent: 'center' }}
      >
        <Card theme={theme} style={{ borderTopWidth: 4, borderTopColor: category.accent }}>
          <Text style={{ color: theme.textMuted, fontSize: 12, fontWeight: '800', letterSpacing: 1 }}>
            THE OFFICER ASKS
          </Text>
          <Text
            style={{
              color: theme.text,
              fontSize: 23,
              fontWeight: '800',
              lineHeight: 31,
              marginTop: spacing.sm,
            }}
          >
            {current.prompt}
          </Text>

          {currentConfidence > 0 && (
            <View style={{ marginTop: spacing.md, flexDirection: 'row' }}>
              <Pill
                theme={theme}
                text={
                  currentConfidence === 3
                    ? 'You marked this Confident'
                    : currentConfidence === 2
                      ? 'You marked this Okay'
                      : 'You marked this Shaky'
                }
                color={
                  currentConfidence === 3
                    ? theme.success
                    : currentConfidence === 2
                      ? theme.warning
                      : theme.danger
                }
              />
            </View>
          )}

          {!revealed ? (
            <Pressable
              onPress={() => setRevealed(true)}
              style={({ pressed }) => ({
                marginTop: spacing.lg,
                borderRadius: radius.md,
                borderWidth: 1.5,
                borderStyle: 'dashed',
                borderColor: theme.border,
                paddingVertical: spacing.lg,
                alignItems: 'center',
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Text style={{ color: theme.textMuted, fontWeight: '700' }}>
                Answer out loud, then tap to see what the officer is looking for
              </Text>
            </Pressable>
          ) : (
            current.tip && (
              <View
                style={{
                  marginTop: spacing.lg,
                  backgroundColor: theme.cardAlt,
                  borderRadius: radius.md,
                  padding: spacing.md,
                }}
              >
                <Text style={{ color: theme.textMuted, fontSize: 12, fontWeight: '800', letterSpacing: 1 }}>
                  WHAT TO KEEP IN MIND
                </Text>
                <Text style={{ color: theme.text, fontSize: 15, lineHeight: 22, marginTop: 4 }}>
                  {current.tip}
                </Text>
              </View>
            )
          )}

          {revealed && (
            <View style={{ marginTop: spacing.lg }}>
              <ConfidencePicker theme={theme} value={currentConfidence} onChange={rate} />
            </View>
          )}
        </Card>
      </ScrollView>

      {/* Bottom nav */}
      <View
        style={{
          flexDirection: 'row',
          gap: spacing.md,
          padding: spacing.lg,
          borderTopWidth: 1,
          borderTopColor: theme.border,
        }}
      >
        <Button
          theme={theme}
          label="Previous"
          variant="ghost"
          onPress={goPrev}
          style={{ flex: 1, opacity: index === 0 ? 0.4 : 1 }}
        />
        {index < qs.length - 1 ? (
          <Button theme={theme} label="Next" onPress={goNext} style={{ flex: 1 }} />
        ) : (
          <Button
            theme={theme}
            label="Finish"
            onPress={() => navigation.goBack()}
            style={{ flex: 1 }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
