/// Modelo liviano de reporte para pintar marcadores en el mapa.
/// Solo contiene los campos necesarios para la visualización.
class ReporteMapaModel {
  final String id;
  final double latitud;
  final double longitud;
  final String tipoHurto;
  final String franjaHoraria;
  final String fechaIncidente;
  final String barrioIngresado;
  final int? comuna;

  const ReporteMapaModel({
    required this.id,
    required this.latitud,
    required this.longitud,
    required this.tipoHurto,
    required this.franjaHoraria,
    required this.fechaIncidente,
    required this.barrioIngresado,
    this.comuna,
  });

  factory ReporteMapaModel.fromJson(Map<String, dynamic> json) {
    return ReporteMapaModel(
      id:              json['id']?.toString() ?? '',
      latitud:         (json['latitud'] as num).toDouble(),
      longitud:        (json['longitud'] as num).toDouble(),
      // Datos migrados pueden tener campos nulos — usamos fallback seguros
      tipoHurto:       json['tipo_hurto']?.toString()      ?? 'otro',
      franjaHoraria:   json['franja_horaria']?.toString()  ?? '',
      fechaIncidente:  json['fecha_incidente']?.toString() ?? '',
      barrioIngresado: json['barrio_ingresado']?.toString() ?? '',
      comuna:          json['comuna'] != null ? (json['comuna'] as num).toInt() : null,
    );
  }

  /// Retorna null si el reporte no tiene coordenadas válidas o si hay error de parseo.
  static ReporteMapaModel? tryFromJson(Map<String, dynamic> json) {
    if (json['latitud'] == null || json['longitud'] == null) return null;
    try {
      return ReporteMapaModel.fromJson(json);
    } catch (_) {
      return null;
    }
  }
}
