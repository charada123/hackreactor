import React, { useCallback, useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { spacing, useTheme } from '../theme';
import { Button, Card, ConfidenceDot } from '../components/ui';
import { categories, questionsForCategory } from '../data/questions';
import { loadProgress, Progress, resetProgress } from '../storage';

export default function ProgressScreen() {
  const theme = useTheme();
  const [progress, setProgress] = useState<Progress>({});

  const refresh = useCallback(() => {
    loadProgress().then(setProgress);
  }, []);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      loadProgress().then((p) => active && setProgress(p));
      return () => {
        active = false;
      };
    }, []),
  );

  const confirmReset = () => {
    Alert.alert(
      'Reset progress?',
      'This clears every self-rating on this device. It cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await resetProgress();
            refresh();
          },
        },
      ],
    );
  };

  const allValues = Object.values(progress).filter((v) => v > 0);
  const confident = allValues.filter((v) => v === 3).length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}>
        <Text style={{ color: theme.text, fontSize: 28, fontWeight: '900', letterSpacing: -0.5 }}>
          Progress
        </Text>
        <Text style={{ color: theme.textMuted, fontSize: 15, marginTop: 4, marginBottom: spacing.lg }}>
          Where you stand by topic. Aim to turn every dot green before your
          interview date.
        </Text>

        <Card theme={theme} style={{ marginBottom: spacing.lg, flexDirection: 'row', justifyContent: 'space-around' }}>
          <Stat theme={theme} value={allValues.length} label="Practiced" color={theme.text} />
          <Stat theme={theme} value={confident} label="Confident" color={theme.success} />
          <Stat
            theme={theme}
            value={allValues.filter((v) => v === 1).length}
            label="Shaky"
            color={theme.danger}
          />
        </Card>

        {categories.map((c) => {
          const qs = questionsForCategory(c.id);
          return (
            <Card theme={theme} key={c.id} style={{ marginBottom: spacing.md }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md }}>
                <Text style={{ fontSize: 20, marginRight: spacing.sm }}>{c.emoji}</Text>
                <Text style={{ color: theme.text, fontSize: 16, fontWeight: '800', flex: 1 }}>
                  {c.title}
                </Text>
                <Text style={{ color: theme.textMuted, fontSize: 13, fontWeight: '700' }}>
                  {qs.filter((q) => (progress[q.id] ?? 0) > 0).length}/{qs.length}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {qs.map((q) => (
                  <ConfidenceDot key={q.id} theme={theme} value={(progress[q.id] ?? 0) as 0 | 1 | 2 | 3} size={14} />
                ))}
              </View>
            </Card>
          );
        })}

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.lg, marginTop: spacing.md }}>
          <Legend theme={theme} color={theme.danger} label="Shaky" />
          <Legend theme={theme} color={theme.warning} label="Okay" />
          <Legend theme={theme} color={theme.success} label="Confident" />
        </View>

        <Button
          theme={theme}
          label="Reset all progress"
          variant="danger"
          onPress={confirmReset}
          style={{ marginTop: spacing.xl }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({
  theme,
  value,
  label,
  color,
}: {
  theme: ReturnType<typeof useTheme>;
  value: number;
  label: string;
  color: string;
}) {
  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={{ color, fontSize: 28, fontWeight: '900' }}>{value}</Text>
      <Text style={{ color: theme.textMuted, fontSize: 13, fontWeight: '600' }}>{label}</Text>
    </View>
  );
}

function Legend({
  theme,
  color,
  label,
}: {
  theme: ReturnType<typeof useTheme>;
  color: string;
  label: string;
}) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: color, marginRight: 6 }} />
      <Text style={{ color: theme.textMuted, fontSize: 13 }}>{label}</Text>
    </View>
  );
}
