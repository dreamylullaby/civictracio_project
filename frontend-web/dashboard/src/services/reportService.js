import api from "./api.js";

/**
 * Obtiene el resumen de conteos para las tarjetas del dashboard.
 */
export const getResumen = async () => {
  const { data } = await api.get("/api/reportes/admin/resumen");
  return data.data;
};

/**
 * Lista reportes con filtros y paginación para el panel admin.
 * @param {Object} params - { page, limit, tipo_hurto, estado, fechaDesde, fechaHasta, comuna }
 */
export const getReportesAdmin = async (params = {}) => {
  const { data } = await api.get("/api/reportes/admin", { params });
  return data;
};

/**
 * Obtiene el detalle completo de un reporte por su ID.
 */
export const getReporteById = async (id) => {
  const { data } = await api.get(`/api/reportes/${id}`);
  return data.data;
};

/**
 * Obtiene reportes con coordenadas para el mapa.
 */
export const getReportesMapa = async () => {
  const { data } = await api.get("/api/reportes/mapa");
  return data.data;
};

/**
 * Cambia el estado de un reporte (activo/oculto/eliminado).
 * Endpoint que Fer debe implementar: PATCH /api/reportes/:id/estado
 * @param {string} id - UUID del reporte
 * @param {string} estado - Nuevo estado ('activo', 'oculto', 'eliminado')
 */
export const cambiarEstadoReporte = async (id, estado) => {
  const { data } = await api.patch(`/api/admin/reportes/${id}/estado`, { estado });
  return data;
};

/**
 * Edita el tipo de hurto de un reporte (solo admin).
 * @param {string} id - UUID del reporte
 * @param {string} tipo_hurto - Nuevo tipo ('atraco', 'raponazo', 'cosquilleo', 'fleteo')
 */
export const editarTipoHurtoReporte = async (id, tipo_hurto) => {
  const { data } = await api.patch(`/api/admin/reportes/${id}/tipo`, { tipo_hurto });
  return data;
};

/**
 * Edita completamente un reporte reasignado (HU-17).
 * Solo aplica cuando el propietario del reporte tiene estado = 'eliminado' o es el usuario anónimo.
 * @param {string} id - UUID del reporte
 * @param {Object} campos - Campos a modificar
 */
export const editarReporteReasignado = async (id, campos) => {
  const { data } = await api.patch(`/api/admin/reportes/${id}/editar`, campos);
  return data;
};

/**
 * Elimina en lote reportes mediante soft delete (estado = 'eliminado').
 * @param {string[]} ids - Array de UUIDs
 */
export const eliminarReportesLote = async (ids) => {
  const { data } = await api.patch('/api/admin/reportes/eliminar-lote', { ids });
  return data;
};


