import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { radius, spacing, useTheme } from '../theme';
import { Button, Card, ConfidencePicker } from '../components/ui';
import { categoryById, questions, Question } from '../data/questions';
import {
  Confidence,
  confidenceLabels,
  saveConfidence,
} from '../storage';
import type { StackProps } from '../navigation';

const SESSION_SIZE = 12;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function fmt(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

type Phase = 'intro' | 'running' | 'done';

export default function MockInterviewScreen({ route, navigation }: StackProps<'MockInterview'>) {
  const theme = useTheme();
  const categoryIds = route.params?.categoryIds;

  const [phase, setPhase] = useState<Phase>('intro');
  const [deck, setDeck] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [ratings, setRatings] = useState<Record<string, Confidence>>({});
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    navigation.setOptions({ title: 'Mock Interview' });
  }, [navigation]);

  const stopTimer = useCallback(() => {
    if (timer.current) {
      clearInterval(timer.current);
      timer.current = null;
    }
  }, []);

  useEffect(() => stopTimer, [stopTimer]);

  const start = useCallback(() => {
    const pool = categoryIds && categoryIds.length > 0
      ? questions.filter((q) => categoryIds.includes(q.categoryId))
      : questions;
    setDeck(shuffle(pool).slice(0, Math.min(SESSION_SIZE, pool.length)));
    setIndex(0);
    setRevealed(false);
    setElapsed(0);
    setRatings({});
    setPhase('running');
    stopTimer();
    timer.current = setInterval(() => setElapsed((e) => e + 1), 1000);
  }, [categoryIds, stopTimer]);

  const current = deck[index];

  const advance = useCallback(() => {
    if (index < deck.length - 1) {
      setIndex((i) => i + 1);
      setRevealed(false);
    } else {
      stopTimer();
      setPhase('done');
    }
  }, [index, deck.length, stopTimer]);

  const rate = useCallback(
    async (value: Confidence) => {
      if (!current) return;
      setRatings((r) => ({ ...r, [current.id]: value }));
      await saveConfidence(current.id, value);
    },
    [current],
  );

  const summary = useMemo(() => {
    const vals = Object.values(ratings);
    return {
      confident: vals.filter((v) => v === 3).length,
      okay: vals.filter((v) => v === 2).length,
      shaky: vals.filter((v) => v === 1).length,
      answered: vals.length,
    };
  }, [ratings]);

  // ---- Intro ----
  if (phase === 'intro') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['bottom']}>
        <ScrollView contentContainerStyle={{ padding: spacing.lg, flexGrow: 1, justifyContent: 'center' }}>
          <Text style={{ fontSize: 44, textAlign: 'center' }}>🎙️</Text>
          <Text
            style={{
              color: theme.text,
              fontSize: 26,
              fontWeight: '900',
              textAlign: 'center',
              marginTop: spacing.md,
            }}
          >
            Mock Interview
          </Text>
          <Text
            style={{
              color: theme.textMuted,
              fontSize: 15,
              textAlign: 'center',
              lineHeight: 22,
              marginTop: spacing.sm,
            }}
          >
            {Math.min(SESSION_SIZE, categoryIds && categoryIds.length > 0
              ? questions.filter((q) => categoryIds.includes(q.categoryId)).length
              : questions.length)}{' '}
            questions, drawn at random, one at a time. A clock runs so you get
            used to answering under a little pressure. Say each answer out loud
            as if the officer is across the desk.
          </Text>
          <Card theme={theme} style={{ marginTop: spacing.xl }}>
            <Text style={{ color: theme.text, fontWeight: '700', lineHeight: 22 }}>
              Tips for a realistic run:
            </Text>
            <Text style={{ color: theme.textMuted, marginTop: spacing.sm, lineHeight: 22 }}>
              • Answer before you reveal the guidance.{'\n'}
              • Speak aloud — don’t just think it.{'\n'}
              • Be honest in your self-rating; that’s what drives your progress.
            </Text>
          </Card>
          <Button theme={theme} label="Begin" onPress={start} style={{ marginTop: spacing.xl }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ---- Done ----
  if (phase === 'done') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['bottom']}>
        <ScrollView contentContainerStyle={{ padding: spacing.lg, flexGrow: 1, justifyContent: 'center' }}>
          <Text style={{ fontSize: 44, textAlign: 'center' }}>✅</Text>
          <Text
            style={{
              color: theme.text,
              fontSize: 26,
              fontWeight: '900',
              textAlign: 'center',
              marginTop: spacing.md,
            }}
          >
            Session complete
          </Text>
          <Text style={{ color: theme.textMuted, textAlign: 'center', marginTop: 4 }}>
            {deck.length} questions in {fmt(elapsed)}
          </Text>

          <Card theme={theme} style={{ marginTop: spacing.xl }}>
            <Row theme={theme} label="Confident" value={summary.confident} color={theme.success} />
            <Row theme={theme} label="Okay" value={summary.okay} color={theme.warning} />
            <Row theme={theme} label="Shaky" value={summary.shaky} color={theme.danger} />
            <Row
              theme={theme}
              label="Not rated"
              value={deck.length - summary.answered}
              color={theme.textMuted}
            />
          </Card>

          <Text style={{ color: theme.textMuted, fontSize: 14, marginTop: spacing.lg, lineHeight: 21 }}>
            Anything you rated Shaky is worth another pass. Your ratings are saved
            to your Progress tab so you can focus your next session.
          </Text>

          <Button theme={theme} label="Run another" onPress={start} style={{ marginTop: spacing.xl }} />
          <Button
            theme={theme}
            label="Done"
            variant="ghost"
            onPress={() => navigation.goBack()}
            style={{ marginTop: spacing.md }}
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ---- Running ----
  if (!current) return null;
  const category = categoryById(current.categoryId);
  const rated = ratings[current.id];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['bottom']}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: spacing.lg,
          paddingTop: spacing.md,
        }}
      >
        <Text style={{ color: theme.textMuted, fontWeight: '800' }}>
          {index + 1} / {deck.length}
        </Text>
        <View
          style={{
            backgroundColor: theme.cardAlt,
            borderRadius: radius.pill,
            paddingHorizontal: spacing.md,
            paddingVertical: 4,
          }}
        >
          <Text style={{ color: theme.text, fontWeight: '800', fontVariant: ['tabular-nums'] }}>
            ⏱ {fmt(elapsed)}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, flexGrow: 1, justifyContent: 'center' }}>
        <Card theme={theme} style={{ borderTopWidth: 4, borderTopColor: category?.accent ?? theme.primary }}>
          <Text style={{ color: category?.accent ?? theme.primary, fontSize: 12, fontWeight: '800', letterSpacing: 1 }}>
            {(category?.emoji ?? '') + '  ' + (category?.title ?? '').toUpperCase()}
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
                Tap when you’ve answered out loud
              </Text>
            </Pressable>
          ) : (
            <>
              {current.tip && (
                <View
                  style={{
                    marginTop: spacing.lg,
                    backgroundColor: theme.cardAlt,
                    borderRadius: radius.md,
                    padding: spacing.md,
                  }}
                >
                  <Text style={{ color: theme.text, fontSize: 15, lineHeight: 22 }}>
                    {current.tip}
                  </Text>
                </View>
              )}
              <View style={{ marginTop: spacing.lg }}>
                <ConfidencePicker theme={theme} value={rated ?? 0} onChange={rate} />
              </View>
            </>
          )}
        </Card>
      </ScrollView>

      <View style={{ padding: spacing.lg, borderTopWidth: 1, borderTopColor: theme.border }}>
        <Button
          theme={theme}
          label={index < deck.length - 1 ? 'Next question' : 'Finish session'}
          onPress={advance}
        />
        {rated != null && (
          <Text style={{ color: theme.textMuted, textAlign: 'center', marginTop: spacing.sm, fontSize: 13 }}>
            Marked “{confidenceLabels[rated]}”
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}

function Row({
  theme,
  label,
  value,
  color,
}: {
  theme: ReturnType<typeof useTheme>;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: spacing.sm,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color, marginRight: spacing.sm }} />
        <Text style={{ color: theme.text, fontSize: 15, fontWeight: '600' }}>{label}</Text>
      </View>
      <Text style={{ color: theme.text, fontSize: 18, fontWeight: '800' }}>{value}</Text>
    </View>
  );
}
