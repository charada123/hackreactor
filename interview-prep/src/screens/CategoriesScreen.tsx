import React, { useCallback, useState } from 'react';
import { ScrollView, Text, View, Pressable } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { radius, spacing, useTheme } from '../theme';
import { Pill } from '../components/ui';
import { categories, questionsForCategory } from '../data/questions';
import { loadProgress, Progress } from '../storage';
import type { RootStackParamList } from '../navigation';

export default function CategoriesScreen() {
  const theme = useTheme();
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}>
        <Text style={{ color: theme.text, fontSize: 28, fontWeight: '900', letterSpacing: -0.5 }}>
          Topics
        </Text>
        <Text style={{ color: theme.textMuted, fontSize: 15, marginTop: 4, marginBottom: spacing.lg }}>
          Tap a topic to flip through its questions, read what the officer is
          looking for, and rate how ready you feel.
        </Text>

        {categories.map((c) => {
          const qs = questionsForCategory(c.id);
          const done = qs.filter((q) => (progress[q.id] ?? 0) > 0).length;
          return (
            <Pressable
              key={c.id}
              onPress={() => nav.navigate('Practice', { categoryId: c.id })}
              style={({ pressed }) => ({
                backgroundColor: theme.card,
                borderRadius: radius.lg,
                borderWidth: 1,
                borderColor: theme.border,
                borderLeftWidth: 5,
                borderLeftColor: c.accent,
                padding: spacing.lg,
                marginBottom: spacing.md,
                opacity: pressed ? 0.75 : 1,
              })}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: 24, marginRight: spacing.sm }}>{c.emoji}</Text>
                <Text style={{ color: theme.text, fontSize: 17, fontWeight: '800', flex: 1 }}>
                  {c.title}
                </Text>
              </View>
              <Text style={{ color: theme.textMuted, fontSize: 14, marginTop: spacing.sm, lineHeight: 20 }}>
                {c.blurb}
              </Text>
              <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md }}>
                <Pill theme={theme} text={`${qs.length} questions`} color={c.accent} />
                {done > 0 && (
                  <Pill theme={theme} text={`${done} practiced`} color={theme.success} />
                )}
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
