import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../../core/app_theme.dart';
import '../../../../../core/onboarding_prefs.dart';

/// Diálogo modal informativo de bienvenida para [MapaPage].
/// Informa de forma clara la lectura del mapa, el significado de los clusters
/// y la diferencia entre datos comunitarios (2026) e históricos (2025).
class GuiaInformativaDialog extends StatefulWidget {
  const GuiaInformativaDialog({super.key, required this.userId});

  final String? userId;

  @override
  State<GuiaInformativaDialog> createState() => _GuiaInformativaDialogState();
}

class _GuiaInformativaDialogState extends State<GuiaInformativaDialog> {
  bool _noVolver = true;

  Future<void> _onEntendido() async {
    if (_noVolver) {
      await OnboardingPrefs.markAsSeen(widget.userId);
    }
    if (mounted) Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardBg = isDark ? const Color(0xFF1E293B) : Colors.white;
    final textColor = isDark ? Colors.white : AppColors.textMain;
    final subColor = isDark ? const Color(0xFF94A3B8) : AppColors.textSub;

    return Dialog(
      backgroundColor: cardBg,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      child: ConstrainedBox(
        constraints: BoxConstraints(
          maxHeight: MediaQuery.of(context).size.height * 0.85,
          maxWidth: MediaQuery.of(context).size.width * 0.9,
        ),
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(22, 24, 22, 18),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Encabezado
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: AppColors.primary.withValues(alpha: 0.12),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(Icons.shield_outlined, color: AppColors.primary, size: 26),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      'Bienvenido a CivicTrackIO',
                      style: GoogleFonts.montserrat(
                        fontSize: 17,
                        fontWeight: FontWeight.bold,
                        color: textColor,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              const Divider(height: 1),
              const SizedBox(height: 16),

              // 1. Qué significan los números (Clusters)
              _InfoRow(
                icon: Icons.bubble_chart_outlined,
                titulo: '¿Qué significan los círculos con números?',
                descripcion:
                    'Representan un conjunto de incidentes agrupados por cercanía. Al hacer zoom, el grupo se desagrega y podrás ver cada caso por separado.',
                textColor: textColor,
                subColor: subColor,
              ),
              const SizedBox(height: 14),

              // 2. Reportes 2026 vs Históricos 2025
              _InfoRow(
                icon: Icons.compare_arrows_rounded,
                titulo: 'Datos en vivo (2026) vs. Históricos (2025)',
                descripcion:
                    '• 2026 (Tiempo real): Reportes creados por los ciudadanos con dirección y tipo de hurto detallado.\n• 2025 (Filtros): Base referencial de +8.000 registros de la Policía Nacional para modelar zonas de calor (no cuentan con GPS exacto a nivel de calle).',
                textColor: textColor,
                subColor: subColor,
              ),
              const SizedBox(height: 14),

              // 3. Colaboración ciudadana
              _InfoRow(
                icon: Icons.add_location_alt_outlined,
                titulo: 'Tu reporte hace la diferencia',
                descripcion:
                    'Usa el botón "Registrar hurto" para reportar incidentes recientes. Toda la información ayuda a alertar a otros usuarios en tiempo real.',
                textColor: textColor,
                subColor: subColor,
              ),
              const SizedBox(height: 16),
              const Divider(height: 1),

              // Checkbox "No volver a mostrar"
              CheckboxListTile(
                value: _noVolver,
                onChanged: (val) => setState(() => _noVolver = val ?? true),
                title: Text(
                  'No volver a mostrar al iniciar',
                  style: GoogleFonts.inter(fontSize: 13, color: subColor),
                ),
                controlAffinity: ListTileControlAffinity.leading,
                contentPadding: EdgeInsets.zero,
                activeColor: AppColors.primary,
                dense: true,
              ),
              const SizedBox(height: 8),

              // Botón de acción principal
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _onEntendido,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 13),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    elevation: 0,
                  ),
                  child: Text(
                    'Entendido / Explorar mapa',
                    style: GoogleFonts.inter(
                      fontWeight: FontWeight.w600,
                      fontSize: 14.5,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Fila informativa compacta con ícono, título y descripción.
class _InfoRow extends StatelessWidget {
  const _InfoRow({
    required this.icon,
    required this.titulo,
    required this.descripcion,
    required this.textColor,
    required this.subColor,
  });

  final IconData icon;
  final String titulo;
  final String descripcion;
  final Color textColor;
  final Color subColor;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, color: AppColors.primary, size: 22),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                titulo,
                style: GoogleFonts.inter(
                  fontSize: 13,
                  fontWeight: FontWeight.bold,
                  color: textColor,
                ),
              ),
              const SizedBox(height: 3),
              Text(
                descripcion,
                style: GoogleFonts.inter(
                  fontSize: 12.5,
                  color: subColor,
                  height: 1.4,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}