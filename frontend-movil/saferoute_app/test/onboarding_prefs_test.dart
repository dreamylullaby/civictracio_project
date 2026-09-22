import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:civictrackio_app/core/onboarding_prefs.dart';

void main() {
  setUp(() {
    SharedPreferences.setMockInitialValues({});
  });

  group('OnboardingPrefs', () {
    test('hasSeen returns false when not yet marked', () async {
      final result = await OnboardingPrefs.hasSeen('user1');
      expect(result, isFalse);
    });

    test('markAsSeen then hasSeen returns true (round-trip)', () async {
      // Feature: welcome-onboarding-dialog, Property 1: markAsSeen/hasSeen round-trip
      await OnboardingPrefs.markAsSeen('user1');
      final result = await OnboardingPrefs.hasSeen('user1');
      expect(result, isTrue);
    });

    test('marking userA does not affect userB (isolation)', () async {
      // Feature: welcome-onboarding-dialog, Property 2: user isolation
      await OnboardingPrefs.markAsSeen('userA');
      final result = await OnboardingPrefs.hasSeen('userB');
      expect(result, isFalse);
    });

    test('null userId uses guest fallback key', () async {
      expect(await OnboardingPrefs.hasSeen(null), isFalse);
      await OnboardingPrefs.markAsSeen(null);
      expect(await OnboardingPrefs.hasSeen(null), isTrue);
    });

    test('empty userId uses guest fallback key', () async {
      await OnboardingPrefs.markAsSeen('');
      expect(await OnboardingPrefs.hasSeen(''), isTrue);
      expect(await OnboardingPrefs.hasSeen(null), isTrue); // same guest key
    });

    test('whitespace userId uses guest fallback key', () async {
      await OnboardingPrefs.markAsSeen('   ');
      expect(await OnboardingPrefs.hasSeen('   '), isTrue);
    });
  });
}
