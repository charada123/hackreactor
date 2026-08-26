import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Tabs: undefined;
  Practice: { categoryId: string };
  MockInterview: { categoryIds?: string[] } | undefined;
};

export type StackProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;
