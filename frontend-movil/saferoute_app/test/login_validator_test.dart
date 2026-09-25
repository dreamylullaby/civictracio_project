import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:civictrackio_app/features/user/presentation/pages/login_Page.dart';

void main() {
  group('HU-02: Login - Pruebas UI', () {

    // CP-HU02-01: Correo vacio muestra campo obligatorio
    testWidgets('CP-HU02-F-01: Campo obligatorio correo', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(home: LoginPage()),
      );

      await tester.tap(find.text('Iniciar sesión'));
      await tester.pump();

      expect(find.text('Campo obligatorio'), findsWidgets);
    });

    // CP-HU02-02: Correo sin @ muestra 'Correo invalido'
    testWidgets('CP-HU02-F-02: Correo inválido', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(home: LoginPage()),
      );

      await tester.enterText(find.byType(TextFormField).at(0), 'usuarioinvalido');
      await tester.enterText(find.byType(TextFormField).at(1), '123456');

      await tester.tap(find.text('Iniciar sesión'));
      await tester.pump();

      // El validador retorna 'Correo invalido' cuando no contiene '@'
      expect(find.text('Correo inválido'), findsOneWidget);
    });

    // CP-HU02-03: Correo con dominio no permitido muestra mensaje de dominio invalido
    testWidgets('CP-HU02-F-03: Dominio de correo no permitido', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(home: LoginPage()),
      );

      await tester.enterText(find.byType(TextFormField).at(0), 'usuario@yahoo.com');
      await tester.enterText(find.byType(TextFormField).at(1), '123456');

      await tester.tap(find.text('Iniciar sesión'));
      await tester.pump();

      // El validador retorna el mensaje de dominio invalido
      expect(
        find.textContaining('El dominio no es válido'),
        findsOneWidget,
      );
    });

    // CP-HU02-04: Password vacio muestra campo obligatorio
    testWidgets('CP-HU02-F-04: Contraseña obligatoria', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(home: LoginPage()),
      );

      // Solo llenar correo valido
      await tester.enterText(find.byType(TextFormField).at(0), 'user@gmail.com');

      await tester.tap(find.text('Iniciar sesión'));
      await tester.pump();

      expect(find.text('Campo obligatorio'), findsWidgets);
    });

    // CP-HU02-05: Correo valido con dominio permitido no muestra error de formato
    testWidgets('CP-HU02-F-05: Correo válido no muestra error de formato', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(home: LoginPage()),
      );

      await tester.enterText(find.byType(TextFormField).at(0), 'usuario@gmail.com');
      await tester.enterText(find.byType(TextFormField).at(1), 'pass123!');

      await tester.tap(find.text('Iniciar sesión'));
      await tester.pump();

      expect(find.text('Correo invalido'), findsNothing);
      expect(find.textContaining('El dominio no es válido'), findsNothing);
    });
  });
}
