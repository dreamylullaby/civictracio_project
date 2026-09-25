import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:civictrackio_app/features/user/presentation/widgets/guia_informativa_dialog.dart';
import 'package:civictrackio_app/core/onboarding_prefs.dart';

void main() {
  setUp(() {
    SharedPreferences.setMockInitialValues({});
  });

  group('GuiaInformativaDialog', () {
    testWidgets('checkbox starts checked (true)', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Builder(
            builder: (ctx) => TextButton(
              onPressed: () => showDialog(
                context: ctx,
                barrierDismissible: false,
                builder: (_) => const GuiaInformativaDialog(userId: 'u1'),
              ),
              child: const Text('open'),
            ),
          ),
        ),
      );
      await tester.tap(find.text('open'));
      await tester.pumpAndSettle();

      final checkbox = tester.widget<Checkbox>(
        find.descendant(
          of: find.byType(CheckboxListTile),
          matching: find.byType(Checkbox),
        ),
      );
      expect(checkbox.value, isTrue);
    });

    testWidgets('contains all required texts', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Builder(
            builder: (ctx) => TextButton(
              onPressed: () => showDialog(
                context: ctx,
                barrierDismissible: false,
                builder: (_) => const GuiaInformativaDialog(userId: 'u1'),
              ),
              child: const Text('open'),
            ),
          ),
        ),
      );
      await tester.tap(find.text('open'));
      await tester.pumpAndSettle();

      expect(find.textContaining('Bienvenido a CivicTrackIO'), findsOneWidget);
      expect(find.textContaining('Cobertura en tiempo real'), findsOneWidget);
      expect(find.textContaining('Datos históricos'), findsOneWidget);
      expect(find.textContaining('Construcción colaborativa'), findsOneWidget);
      expect(find.textContaining('Registrar hurto'), findsOneWidget);
    });

    testWidgets('tap Entendido with checkbox=true persists flag', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Builder(
            builder: (ctx) => TextButton(
              onPressed: () => showDialog(
                context: ctx,
                barrierDismissible: false,
                builder: (_) => const GuiaInformativaDialog(userId: 'u1'),
              ),
              child: const Text('open'),
            ),
          ),
        ),
      );
      await tester.tap(find.text('open'));
      await tester.pumpAndSettle();

      // Scroll to ensure the button is visible, then tap
      await tester.ensureVisible(find.text('Entendido'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Entendido'), warnIfMissed: false);
      await tester.pumpAndSettle();

      expect(await OnboardingPrefs.hasSeen('u1'), isTrue);
    });

    testWidgets('tap Entendido with checkbox=false does not persist flag',
        (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Builder(
            builder: (ctx) => TextButton(
              onPressed: () => showDialog(
                context: ctx,
                barrierDismissible: false,
                builder: (_) => const GuiaInformativaDialog(userId: 'u2'),
              ),
              child: const Text('open'),
            ),
          ),
        ),
      );
      await tester.tap(find.text('open'));
      await tester.pumpAndSettle();

      // Scroll to checkbox and uncheck it
      await tester.ensureVisible(find.byType(CheckboxListTile));
      await tester.pumpAndSettle();
      await tester.tap(find.byType(CheckboxListTile));
      await tester.pump();

      // Scroll to button and tap
      await tester.ensureVisible(find.text('Entendido'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Entendido'), warnIfMissed: false);
      await tester.pumpAndSettle();

      expect(await OnboardingPrefs.hasSeen('u2'), isFalse);
    });
  });
}
