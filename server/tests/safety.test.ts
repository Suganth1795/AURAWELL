import { describe, expect, it } from 'vitest';
import {
  assessSafety,
  detectSafetyLevel,
  safetyResponse,
  CRISIS_RESOURCES,
} from '../src/services/safety.service.js';

describe('safety screening', () => {
  it('flags clear self-harm language', () => {
    const phrases = [
      'I want to kill myself',
      'I have been thinking about suicide',
      'I want to end my life',
      'I keep self-harming',
      "I don't want to live anymore",
    ];
    for (const phrase of phrases) {
      expect(detectSafetyLevel(phrase).level).toBe('crisis_support');
    }
  });

  it('flags medical boundary requests', () => {
    const phrases = [
      'What dosage of sertraline should I take?',
      'Do I have depression or bipolar?',
      'Should I stop taking my medication?',
      'Can you prescribe something for my anxiety?',
    ];
    for (const phrase of phrases) {
      expect(detectSafetyLevel(phrase).level).toBe('boundary_redirect');
    }
  });

  it('does not flag benign expressions', () => {
    const phrases = [
      'This homework is killing me',
      'I am so tired of my alarm',
      'My anxiety about the exam is high',
      'I feel low today and a bit lonely',
    ];
    for (const phrase of phrases) {
      expect(detectSafetyLevel(phrase).level).toBe('none');
    }
  });

  it('produces canned crisis responses containing real resources and never LLM text', () => {
    const assessment = assessSafety('I want to kill myself', 'adult');
    expect(assessment.level).toBe('crisis_support');
    expect(assessment.flag).toBe('possible_self_harm');
    expect(assessment.response).toContain('988');
    for (const resource of CRISIS_RESOURCES) {
      expect(assessment.response).toContain(resource.contact);
    }
  });

  it('adds a trusted-adult prompt for children and teens in crisis', () => {
    const child = safetyResponse('crisis_support', 'child') ?? '';
    const teen = safetyResponse('crisis_support', 'teen') ?? '';
    const adult = safetyResponse('crisis_support', 'adult') ?? '';
    expect(child).toMatch(/trusted adult/i);
    expect(teen).toMatch(/trusted adult/i);
    expect(adult).not.toMatch(/trusted adult/i);
  });

  it('redirects medical questions without diagnosing', () => {
    const assessment = assessSafety('Do I have depression?', 'adult');
    expect(assessment.level).toBe('boundary_redirect');
    expect(assessment.response).toMatch(/can't diagnose|cannot diagnose/i);
    expect(assessment.response).toMatch(/professional/i);
  });

  it('returns no response for neutral messages', () => {
    const assessment = assessSafety('I had a nice walk today', 'adult');
    expect(assessment.level).toBe('none');
    expect(assessment.response).toBeNull();
  });
});
