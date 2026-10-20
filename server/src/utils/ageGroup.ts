export type AgeGroup = 'child' | 'teen' | 'adult' | 'older_adult';

export const AGE_GROUP_VALUES: AgeGroup[] = ['child', 'teen', 'adult', 'older_adult'];

export function ageGroupFromAge(age: number): AgeGroup {
  if (age < 13) return 'child';
  if (age < 18) return 'teen';
  if (age < 60) return 'adult';
  return 'older_adult';
}

export function ageGroupFromBirthYear(birthYear: number, now = new Date()): AgeGroup {
  const age = now.getFullYear() - birthYear;
  return ageGroupFromAge(age);
}

export const AGE_GROUP_LABELS: Record<AgeGroup, string> = {
  child: 'Child (6-12)',
  teen: 'Teenager (13-17)',
  adult: 'Adult (18-59)',
  older_adult: 'Older adult (60+)',
};
