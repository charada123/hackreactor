import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { spacing, useTheme } from '../theme';
import { Card } from '../components/ui';
import { DISCLAIMER, tipSections } from '../data/tips';

export default function TipsScreen() {
  const theme = useTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}>
        <Text style={{ color: theme.text, fontSize: 28, fontWeight: '900', letterSpacing: -0.5 }}>
          Interview tips
        </Text>
        <Text style={{ color: theme.textMuted, fontSize: 15, marginTop: 4, marginBottom: spacing.lg }}>
          How to prepare and carry yourself, from the notice through the day of.
        </Text>

        {tipSections.map((s) => (
          <Card theme={theme} key={s.id} style={{ marginBottom: spacing.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md }}>
              <Text style={{ fontSize: 22, marginRight: spacing.sm }}>{s.emoji}</Text>
              <Text style={{ color: theme.text, fontSize: 18, fontWeight: '800' }}>{s.title}</Text>
            </View>
            {s.points.map((p, i) => (
              <View key={i} style={{ flexDirection: 'row', marginBottom: spacing.sm }}>
                <Text style={{ color: theme.primary, marginRight: spacing.sm, fontWeight: '900' }}>•</Text>
                <Text style={{ color: theme.text, fontSize: 15, lineHeight: 22, flex: 1 }}>{p}</Text>
              </View>
            ))}
          </Card>
        ))}

        <View
          style={{
            marginTop: spacing.sm,
            backgroundColor: theme.cardAlt,
            borderRadius: 12,
            padding: spacing.lg,
          }}
        >
          <Text style={{ color: theme.textMuted, fontSize: 13, lineHeight: 20 }}>⚠️  {DISCLAIMER}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
