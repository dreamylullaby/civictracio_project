import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:civictrackio_app/features/user/presentation/pages/register_Page.dart';

Widget buildTestable() {
  return MaterialApp(
    routes: {
      '/login': (_) => const Scaffold(
            body: Center(child: Text('Login Page')),
          ),
    },
    home: const RegisterPage(),
  );
}

Future<void> llenarFormularioValido(WidgetTester tester) async {
  await tester.enterText(find.byType(TextFormField).at(0), 'Luna');
  await tester.enterText(find.byType(TextFormField).at(1), 'luna@gmail.com');
  await tester.enterText(find.byType(TextFormField).at(2), 'ClaveSegura123!');
  await tester.enterText(find.byType(TextFormField).at(3), 'ClaveSegura123!');
  await tester.pumpAndSettle();
}

Future<void> scrollHastaBoton(WidgetTester tester) async {
  await tester.scrollUntilVisible(
    find.text('Registrarse'),
    200,
    scrollable: find.byType(Scrollable).first,
  );
  await tester.pumpAndSettle();
}

Future<void> scrollHastaTerminos(WidgetTester tester) async {
  await tester.scrollUntilVisible(
    find.byType(Checkbox),
    200,
    scrollable: find.byType(Scrollable).first,
  );
  await tester.pumpAndSettle();
}

Future<void> tapEnlaceLegal(WidgetTester tester, String enlace) async {
  final richTextFinder = find.byWidgetPredicate(
    (widget) =>
        widget is RichText &&
        widget.text.toPlainText().contains(enlace),
  );
  expect(richTextFinder, findsOneWidget);

  final richText = tester.widget<RichText>(richTextFinder);
  TapGestureRecognizer? recognizer;

  void buscarReconocedor(InlineSpan span) {
    if (span is TextSpan) {
      if (span.text == enlace && span.recognizer is TapGestureRecognizer) {
        recognizer = span.recognizer as TapGestureRecognizer;
      }
      span.children?.forEach(buscarReconocedor);
    }
  }

  buscarReconocedor(richText.text);
  expect(recognizer, isNotNull);
  recognizer!.onTap?.call();
  await tester.pumpAndSettle();
}

void main() {
  group('HU-04 Integrales Flutter - Términos y Condiciones', () {
    testWidgets('CP-HU04-I-01 no registra si no acepta términos', (tester) async {
      await tester.pumpWidget(buildTestable());

      await tester.pumpAndSettle();
      await llenarFormularioValido(tester);
      await scrollHastaBoton(tester);

      await tester.tap(find.text('Registrarse'));
      await tester.pumpAndSettle();

      expect(
        find.text(
          'Debes aceptar los Términos y Condiciones y la Política de Privacidad para registrarte.',
        ),
        findsOneWidget,
      );
    });

    testWidgets('CP-HU04-I-02 visualiza términos y condiciones', (tester) async {
      await tester.pumpWidget(buildTestable());

      await tester.pumpAndSettle();
      await scrollHastaTerminos(tester);

      await tapEnlaceLegal(tester, 'Términos y Condiciones');

      expect(find.byType(Dialog), findsOneWidget);
      expect(find.text('Términos y Condiciones'), findsWidgets);
    });
  });
}
