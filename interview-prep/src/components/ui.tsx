import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
  StyleProp,
  TextStyle,
} from 'react-native';
import { radius, spacing, Theme } from '../theme';
import { Confidence, confidenceLabels } from '../storage';

export function Card({
  theme,
  children,
  style,
}: {
  theme: Theme;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View
      style={[
        {
          backgroundColor: theme.card,
          borderRadius: radius.lg,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: theme.border,
          padding: spacing.lg,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function Button({
  theme,
  label,
  onPress,
  variant = 'primary',
  style,
}: {
  theme: Theme;
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost' | 'danger';
  style?: StyleProp<ViewStyle>;
}) {
  const bg =
    variant === 'primary'
      ? theme.primary
      : variant === 'danger'
        ? 'transparent'
        : 'transparent';
  const fg =
    variant === 'primary'
      ? theme.primaryText
      : variant === 'danger'
        ? theme.danger
        : theme.text;
  const borderColor = variant === 'primary' ? theme.primary : theme.border;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          backgroundColor: bg,
          borderColor,
          borderWidth: 1.5,
          borderRadius: radius.pill,
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.xl,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: pressed ? 0.7 : 1,
        },
        style,
      ]}
    >
      <Text style={{ color: fg, fontWeight: '700', fontSize: 16 }}>{label}</Text>
    </Pressable>
  );
}

export function Pill({
  theme,
  text,
  color,
  textStyle,
}: {
  theme: Theme;
  text: string;
  color?: string;
  textStyle?: StyleProp<TextStyle>;
}) {
  const c = color ?? theme.textMuted;
  return (
    <View
      style={{
        alignSelf: 'flex-start',
        backgroundColor: c + '22',
        borderRadius: radius.pill,
        paddingVertical: 4,
        paddingHorizontal: 10,
      }}
    >
      <Text style={[{ color: c, fontWeight: '700', fontSize: 12 }, textStyle]}>
        {text}
      </Text>
    </View>
  );
}

const confidenceColors = (theme: Theme): Record<Confidence, string> => ({
  0: theme.textMuted,
  1: theme.danger,
  2: theme.warning,
  3: theme.success,
});

export function ConfidencePicker({
  theme,
  value,
  onChange,
}: {
  theme: Theme;
  value: Confidence;
  onChange: (v: Confidence) => void;
}) {
  const colors = confidenceColors(theme);
  const options: Confidence[] = [1, 2, 3];
  return (
    <View>
      <Text
        style={{
          color: theme.textMuted,
          fontSize: 13,
          marginBottom: spacing.sm,
          fontWeight: '600',
        }}
      >
        How ready did that feel?
      </Text>
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        {options.map((opt) => {
          const active = value === opt;
          return (
            <Pressable
              key={opt}
              onPress={() => onChange(opt)}
              style={{
                flex: 1,
                borderRadius: radius.md,
                borderWidth: 1.5,
                borderColor: active ? colors[opt] : theme.border,
                backgroundColor: active ? colors[opt] + '22' : 'transparent',
                paddingVertical: spacing.md,
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  color: active ? colors[opt] : theme.text,
                  fontWeight: '700',
                }}
              >
                {confidenceLabels[opt]}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function ConfidenceDot({
  theme,
  value,
  size = 10,
}: {
  theme: Theme;
  value: Confidence;
  size?: number;
}) {
  const colors = confidenceColors(theme);
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: value === 0 ? 'transparent' : colors[value],
        borderWidth: value === 0 ? 1.5 : 0,
        borderColor: theme.border,
      }}
    />
  );
}

export function SectionHeader({
  theme,
  title,
  right,
}: {
  theme: Theme;
  title: string;
  right?: React.ReactNode;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.md,
        marginTop: spacing.lg,
      }}
    >
      <Text
        style={{
          color: theme.text,
          fontSize: 20,
          fontWeight: '800',
          letterSpacing: -0.3,
        }}
      >
        {title}
      </Text>
      {right}
    </View>
  );
}
