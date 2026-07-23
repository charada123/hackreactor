import React, { useCallback, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { spacing } from '../theme';
import { useTheme } from '../theme';
import { Button, Card, Pill } from '../components/ui';
import { categories, questions } from '../data/questions';
import { loadProgress, Progress } from '../storage';
import type { RootStackParamList } from '../navigation';

export default function HomeScreen() {
  const theme = useTheme();
  const nav =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [progress, setProgress] = useState<Progress>({});

  useFocusEffect(
    useCallback(() => {
      let active = true;
      loadProgress().then((p) => active && setProgress(p));
      return () => {
        active = false;
      };
    }, []),
  );

  const total = questions.length;
  const rated = Object.values(progress).filter((v) => v > 0).length;
  const confident = Object.values(progress).filter((v) => v === 3).length;
  const pct = total === 0 ? 0 : Math.round((rated / total) * 100);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}>
        <Text
          style={{
            color: theme.textMuted,
            fontSize: 14,
            fontWeight: '700',
            letterSpacing: 1,
            textTransform: 'uppercase',
          }}
        >
          Green Card Interview
        </Text>
        <Text
          style={{
            color: theme.text,
            fontSize: 30,
            fontWeight: '900',
            letterSpacing: -0.6,
            marginTop: 2,
          }}
        >
          I-485 Interview Prep
        </Text>
        <Text style={{ color: theme.textMuted, fontSize: 15, marginTop: spacing.sm, lineHeight: 21 }}>
          Practice the questions a USCIS officer asks at your Adjustment of
          Status interview — on your own time, until they feel natural.
        </Text>

        <Card theme={theme} style={{ marginTop: spacing.xl }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View>
              <Text style={{ color: theme.text, fontSize: 17, fontWeight: '800' }}>
                Your readiness
              </Text>
              <Text style={{ color: theme.textMuted, fontSize: 13, marginTop: 2 }}>
                {rated} of {total} questions practiced
              </Text>
            </View>
            <Text style={{ color: theme.primary, fontSize: 30, fontWeight: '900' }}>
              {pct}%
            </Text>
          </View>
          <View
            style={{
              height: 10,
              borderRadius: 999,
              backgroundColor: theme.cardAlt,
              marginTop: spacing.md,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                width: `${pct}%`,
                height: '100%',
                backgroundColor: theme.primary,
              }}
            />
          </View>
          <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md }}>
            <Pill theme={theme} text={`${confident} confident`} color={theme.success} />
            <Pill theme={theme} text={`${total - rated} to go`} color={theme.textMuted} />
          </View>
        </Card>

        <Card theme={theme} style={{ marginTop: spacing.lg }}>
          <Text style={{ color: theme.text, fontSize: 17, fontWeight: '800' }}>
            Mock interview
          </Text>
          <Text style={{ color: theme.textMuted, fontSize: 14, marginTop: 4, lineHeight: 20 }}>
            A timed run through a mix of questions, one at a time, the way a real
            officer moves. Rate yourself afterward.
          </Text>
          <Button
            theme={theme}
            label="Start mock interview"
            onPress={() => nav.navigate('MockInterview')}
            style={{ marginTop: spacing.md }}
          />
        </Card>

        <Text
          style={{
            color: theme.text,
            fontSize: 20,
            fontWeight: '800',
            marginTop: spacing.xl,
            marginBottom: spacing.md,
          }}
        >
          Practice by topic
        </Text>
        {categories.map((c) => {
          const catQs = questions.filter((q) => q.categoryId === c.id);
          const catRated = catQs.filter((q) => (progress[q.id] ?? 0) > 0).length;
          return (
            <Card
              theme={theme}
              key={c.id}
              style={{ marginBottom: spacing.md }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: 26, marginRight: spacing.md }}>{c.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: theme.text, fontSize: 16, fontWeight: '800' }}>
                    {c.title}
                  </Text>
                  <Text style={{ color: theme.textMuted, fontSize: 13, marginTop: 2 }}>
                    {catRated}/{catQs.length} practiced
                  </Text>
                </View>
                <Button
                  theme={theme}
                  label="Practice"
                  variant="ghost"
                  onPress={() => nav.navigate('Practice', { categoryId: c.id })}
                />
              </View>
            </Card>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
