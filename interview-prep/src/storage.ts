import AsyncStorage from '@react-native-async-storage/async-storage';

// Per-question self-rating after practicing. 0 = not yet rated.
export type Confidence = 0 | 1 | 2 | 3; // 0 none, 1 shaky, 2 okay, 3 confident

export type Progress = Record<string, Confidence>;

const KEY = 'i485.progress.v1';

export async function loadProgress(): Promise<Progress> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? (parsed as Progress) : {};
  } catch {
    return {};
  }
}

export async function saveConfidence(
  questionId: string,
  value: Confidence,
): Promise<Progress> {
  const current = await loadProgress();
  const next: Progress = { ...current, [questionId]: value };
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // best effort; ignore write failures
  }
  return next;
}

export async function resetProgress(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}

export const confidenceLabels: Record<Confidence, string> = {
  0: 'Not rated',
  1: 'Shaky',
  2: 'Okay',
  3: 'Confident',
};
