import 'package:shared_preferences/shared_preferences.dart';

/// Utilidad estática para persistir el flag de visibilidad del diálogo
/// de bienvenida por cuenta de usuario usando [SharedPreferences].
class OnboardingPrefs {
  static const _fallbackKey = 'guia_bienvenida_vista_guest';

  /// Devuelve la clave de [SharedPreferences] para el [userId] dado.
  /// Si [userId] es nulo o solo contiene espacios usa la clave guest.
  static String _keyFor(String? userId) =>
      (userId == null || userId.trim().isEmpty)
          ? _fallbackKey
          : 'guia_bienvenida_vista_$userId';

  /// Retorna `true` si el usuario ya vio el diálogo de bienvenida.
  /// Si [SharedPreferences] no está disponible retorna `false` para que el
  /// diálogo se muestre sin causar un crash.
  static Future<bool> hasSeen(String? userId) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      return prefs.getBool(_keyFor(userId)) ?? false;
    } catch (_) {
      return false;
    }
  }

  /// Persiste el flag indicando que el usuario ya vio el diálogo.
  static Future<void> markAsSeen(String? userId) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_keyFor(userId), true);
  }
}
