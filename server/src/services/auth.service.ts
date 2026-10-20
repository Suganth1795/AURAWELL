import { User, ConsentRecord, type UserDoc } from '../models/index.js';
import { HttpError } from '../middleware/error.js';
import {
  checkPasswordPolicy,
  generateToken,
  hashPassword,
  hashToken,
  verifyPassword,
} from '../utils/password.js';
import { ageGroupFromBirthYear, type AgeGroup } from '../utils/ageGroup.js';

export const CONSENT_POLICY_VERSION = '2026-01';

export interface RegisterInput {
  email: string;
  password: string;
  displayName: string;
  birthYear?: number;
  ageGroup?: string;
  guardianConsent: boolean;
  guardianName?: string;
  consents: { termsOfService: boolean; privacyPolicy: boolean; aiWellnessData: boolean };
}

export async function registerUser(input: RegisterInput): Promise<UserDoc> {
  const policy = checkPasswordPolicy(input.password);
  if (!policy.ok) throw new HttpError(400, policy.message ?? 'Invalid password', 'weak_password');

  const existing = await User.findOne({ email: input.email, status: 'active' });
  if (existing) throw new HttpError(409, 'An account with this email already exists', 'email_taken');

  let ageGroup: AgeGroup;
  if (input.birthYear !== undefined) {
    ageGroup = ageGroupFromBirthYear(input.birthYear);
  } else {
    ageGroup = input.ageGroup as AgeGroup;
  }

  if (ageGroup === 'child' && !input.guardianConsent) {
    throw new HttpError(
      400,
      'A parent or guardian must consent for children under 13',
      'guardian_consent_required',
    );
  }

  if (!input.consents.termsOfService || !input.consents.privacyPolicy) {
    throw new HttpError(400, 'Terms of service and privacy policy consent are required', 'consent_required');
  }

  const passwordHash = await hashPassword(input.password);
  const user = await User.create({
    email: input.email,
    passwordHash,
    displayName: input.displayName,
    birthYear: input.birthYear,
    ageGroup,
  });

  await ConsentRecord.create([
    { userId: user.id, type: 'terms_of_service', granted: true, version: CONSENT_POLICY_VERSION },
    { userId: user.id, type: 'privacy_policy', granted: true, version: CONSENT_POLICY_VERSION },
    {
      userId: user.id,
      type: 'ai_wellness_data',
      granted: input.consents.aiWellnessData,
      version: CONSENT_POLICY_VERSION,
    },
    ...(ageGroup === 'child'
      ? [
          {
            userId: user.id,
            type: 'guardian_minor' as const,
            granted: true,
            version: CONSENT_POLICY_VERSION,
            source: 'guardian' as const,
            note: input.guardianName ? `Guardian: ${input.guardianName}` : undefined,
          },
        ]
      : []),
  ]);

  return user;
}

export async function authenticateUser(email: string, password: string): Promise<UserDoc> {
  const user = await User.findOne({ email, status: 'active' }).select('+passwordHash');
  if (!user) throw new HttpError(401, 'Invalid email or password', 'invalid_credentials');
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) throw new HttpError(401, 'Invalid email or password', 'invalid_credentials');
  user.lastLoginAt = new Date();
  await user.save();
  return user;
}

export async function requestPasswordReset(email: string): Promise<{ devToken?: string }> {
  const user = await User.findOne({ email, status: 'active' });
  // Do not reveal whether the account exists.
  if (!user) return {};
  const token = generateToken();
  user.passwordResetTokenHash = hashToken(token);
  user.passwordResetExpires = new Date(Date.now() + 30 * 60 * 1000);
  await user.save();
  // A production deployment must email this token; it is only echoed in non-production.
  return process.env.NODE_ENV === 'production' ? {} : { devToken: token };
}

export async function resetPassword(token: string, password: string): Promise<void> {
  const policy = checkPasswordPolicy(password);
  if (!policy.ok) throw new HttpError(400, policy.message ?? 'Invalid password', 'weak_password');
  const user = await User.findOne({
    passwordResetTokenHash: hashToken(token),
    passwordResetExpires: { $gt: new Date() },
    status: 'active',
  }).select('+passwordResetTokenHash +passwordResetExpires');
  if (!user) throw new HttpError(400, 'Reset link is invalid or has expired', 'invalid_reset_token');
  user.passwordHash = await hashPassword(password);
  user.passwordResetTokenHash = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
}

export async function changePassword(
  user: UserDoc,
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  const policy = checkPasswordPolicy(newPassword);
  if (!policy.ok) throw new HttpError(400, policy.message ?? 'Invalid password', 'weak_password');
  const full = await User.findById(user.id).select('+passwordHash');
  if (!full) throw new HttpError(401, 'Authentication required', 'unauthenticated');
  const ok = await verifyPassword(currentPassword, full.passwordHash);
  if (!ok) throw new HttpError(400, 'Current password is incorrect', 'invalid_password');
  full.passwordHash = await hashPassword(newPassword);
  await full.save();
}

export function computeAgeGroup(birthYear?: number | null): AgeGroup | undefined {
  if (!birthYear) return undefined;
  return ageGroupFromBirthYear(birthYear);
}
