/**
 * Modal con el detalle completo de un reporte de hurto.
 * Si el reporte fue reasignado (propietario eliminado o UUID anónimo),
 * habilita edición completa de todos los campos editables (HU-17).
 */
import { useState } from "react";
import { editarReporteReasignado } from "../services/reportService";

const UUID_ANONIMO = "645c346d-e56a-4022-b488-e8142e0c96a5";

const TIPOS_HURTO       = ["atraco", "raponazo", "cosquilleo", "fleteo"];
const TIPOS_REPORTANTE  = ["victima", "testigo"];
const FRANJAS           = ["00:00-05:59", "06:00-11:59", "12:00-17:59", "18:00-23:59"];
const OBJETOS_HURTADOS  = ["celular", "dinero", "tarjetas_documentos", "articulos_personales", "dispositivos_electronicos"];
const NUM_AGRESORES     = ["1", "2", "3+", "desconocido"];

const colores = {
  atraco: "#b91c1c", raponazo: "#0891b2",
  fleteo: "#d946ef", cosquilleo: "#7c3aed",
};

function esReasignado(reporte) {
  if (!reporte) return false;
  if (reporte.usuario_id === UUID_ANONIMO) return true;
  // El backend devuelve el reporte con la relación usuarios embebida cuando es posible
  // Si el campo propietario_estado viene del endpoint admin, lo usamos
  if (reporte.propietario_estado === "eliminado") return true;
  // Fallback: si usuario_id es el anónimo ya está cubierto arriba
  return false;
}

export default function ReporteDetalle({ reporte, onClose, onActualizado }) {
  const [editando,  setEditando]  = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mensaje,   setMensaje]   = useState(null);

  const [form, setForm] = useState({
    tipo_reportante:  reporte?.tipo_reportante  || "",
    fecha_incidente:  reporte?.fecha_incidente  || "",
    franja_horaria:   reporte?.franja_horaria   || "",
    tipo_hurto:       reporte?.tipo_hurto       || "",
    descripcion:      reporte?.descripcion      || "",
    objeto_hurtado:   reporte?.objeto_hurtado   || "",
    numero_agresores: reporte?.numero_agresores || "",
    barrio_ingresado: reporte?.barrio_ingresado || "",
    direccion:        reporte?.direccion        || "",
  });

  if (!reporte) return null;

  const reasignado = esReasignado(reporte);

  const handleChange = (campo, valor) => {
    setForm(f => ({ ...f, [campo]: valor }));
    setMensaje(null);
  };

  const guardar = async () => {
    setGuardando(true);
    setMensaje(null);
    try {
      // Solo enviar campos que difieren del original
      const cambios = {};
      for (const [k, v] of Object.entries(form)) {
        const original = reporte[k] ?? "";
        if (v !== original) cambios[k] = v;
      }
      if (Object.keys(cambios).length === 0) {
        setMensaje({ tipo: "info", texto: "No hay cambios para guardar" });
        setGuardando(false);
        return;
      }
      await editarReporteReasignado(reporte.id, cambios);
      setMensaje({ tipo: "ok", texto: "Reporte actualizado correctamente" });
      setEditando(false);
      if (onActualizado) onActualizado();
    } catch (e) {
      setMensaje({ tipo: "error", texto: e.response?.data?.message || "Error al guardar" });
    } finally {
      setGuardando(false);
    }
  };

  const cancelar = () => {
    setForm({
      tipo_reportante:  reporte.tipo_reportante  || "",
      fecha_incidente:  reporte.fecha_incidente  || "",
      franja_horaria:   reporte.franja_horaria   || "",
      tipo_hurto:       reporte.tipo_hurto       || "",
      descripcion:      reporte.descripcion      || "",
      objeto_hurtado:   reporte.objeto_hurtado   || "",
      numero_agresores: reporte.numero_agresores || "",
      barrio_ingresado: reporte.barrio_ingresado || "",
      direccion:        reporte.direccion        || "",
    });
    setMensaje(null);
    setEditando(false);
  };

  // Componente de campo solo lectura
  const campo = (label, valor) =>
    valor ? (
      <div style={S.campo}>
        <span style={S.label}>{label}</span>
        <span style={S.valor}>{valor}</span>
      </div>
    ) : null;

  // Componente de campo editable
  const campoEdit = (label, key, tipo = "text", opciones = null) => (
    <div style={S.campoEdit} key={key}>
      <label style={S.labelEdit}>{label}</label>
      {opciones ? (
        <select
          value={form[key]}
          onChange={e => handleChange(key, e.target.value)}
          style={S.input}
        >
          <option value="">— sin cambio —</option>
          {opciones.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : tipo === "textarea" ? (
        <textarea
          value={form[key]}
          onChange={e => handleChange(key, e.target.value)}
          style={{ ...S.input, height: 72, resize: "vertical" }}
          maxLength={300}
        />
      ) : (
        <input
          type={tipo}
          value={form[key]}
          onChange={e => handleChange(key, e.target.value)}
          style={S.input}
        />
      )}
    </div>
  );

  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.modal} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={S.header}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <h2 style={S.titulo}>Detalle del reporte</h2>
            {reasignado && (
              <span style={S.badgeReasignado}>Reasignado</span>
            )}
          </div>
          <button style={S.cerrar} onClick={onClose}>✕</button>
        </div>

        {/* Body */}
        <div style={S.body}>
          <div style={S.badge(reporte.tipo_hurto)}>
            {reporte.tipo_hurto?.toUpperCase()}
          </div>

          {/* Mensaje de feedback */}
          {mensaje && (
            <div style={S.mensaje(mensaje.tipo)}>{mensaje.texto}</div>
          )}

          {editando && reasignado ? (
            /* Modo edición */
            <div>
              <p style={S.editInfo}>
                Editando reporte reasignado. Solo se actualizarán los campos que modifiques.
              </p>
              {campoEdit("Tipo reportante",  "tipo_reportante",  "text", TIPOS_REPORTANTE)}
              {campoEdit("Fecha incidente",  "fecha_incidente",  "date")}
              {campoEdit("Franja horaria",   "franja_horaria",   "text", FRANJAS)}
              {campoEdit("Tipo de hurto",    "tipo_hurto",       "text", TIPOS_HURTO)}
              {campoEdit("Objeto hurtado",   "objeto_hurtado",   "text", OBJETOS_HURTADOS)}
              {campoEdit("N° agresores",     "numero_agresores", "text", NUM_AGRESORES)}
              {campoEdit("Barrio",           "barrio_ingresado")}
              {campoEdit("Dirección",        "direccion")}
              {campoEdit("Descripción",      "descripcion",      "textarea")}
            </div>
          ) : (
            /* Modo lectura */
            <div>
              {campo("ID",               reporte.id)}
              {campo("Estado",           reporte.estado)}
              {campo("Tipo reportante",  reporte.tipo_reportante)}
              {campo("Fecha incidente",  reporte.fecha_incidente)}
              {campo("Franja horaria",   reporte.franja_horaria)}
              {campo("Barrio",           reporte.barrio_ingresado)}
              {campo("Dirección",        reporte.direccion)}
              {campo("Comuna",           reporte.comuna ? `Comuna ${reporte.comuna}` : null)}
              {campo("Coordenadas",      reporte.latitud ? `${reporte.latitud}, ${reporte.longitud}` : null)}
              {campo("Objeto hurtado",   reporte.objeto_hurtado)}
              {campo("N° agresores",     reporte.numero_agresores)}
              {campo("Descripción",      reporte.descripcion)}
              {campo("Fecha creación",   reporte.fecha_creacion ? new Date(reporte.fecha_creacion).toLocaleString("es-CO") : null)}
              {campo("Última edición",   reporte.fecha_actualizacion ? new Date(reporte.fecha_actualizacion).toLocaleString("es-CO") : null)}
            </div>
          )}
        </div>

        {/* Footer con acciones */}
        {reasignado && (
          <div style={S.footer}>
            {editando ? (
              <>
                <button onClick={cancelar} style={S.btnSecundario} disabled={guardando}>
                  Cancelar
                </button>
                <button onClick={guardar} style={S.btnPrimario} disabled={guardando}>
                  {guardando ? "Guardando..." : "Guardar cambios"}
                </button>
              </>
            ) : (
              <button onClick={() => setEditando(true)} style={S.btnPrimario}>
                ✏️ Editar reporte
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const S = {
  overlay: {
    position: "fixed", inset: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    width: "100%", maxWidth: "540px",
    maxHeight: "88vh", overflowY: "auto",
    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
    display: "flex", flexDirection: "column",
  },
  header: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "20px 24px 16px",
    borderBottom: "1px solid #e2e8f0",
    flexShrink: 0,
  },
  titulo: { margin: 0, fontSize: "18px", color: "#1e293b" },
  cerrar: {
    background: "none", border: "none",
    fontSize: "18px", cursor: "pointer", color: "#64748b",
  },
  badgeReasignado: {
    padding: "2px 8px", borderRadius: "10px",
    backgroundColor: "#fef3c7", color: "#92400e",
    fontSize: "11px", fontWeight: "600",
  },
  body: { padding: "20px 24px", flex: 1 },
  footer: {
    display: "flex", justifyContent: "flex-end", gap: 10,
    padding: "12px 24px 16px",
    borderTop: "1px solid #e2e8f0",
    flexShrink: 0,
  },
  badge: (tipo) => ({
    display: "inline-block",
    padding: "4px 12px",
    borderRadius: "20px",
    backgroundColor: colores[tipo] || "#64748b",
    color: "#fff",
    fontSize: "12px",
    fontWeight: "600",
    marginBottom: "16px",
  }),
  campo: {
    display: "flex", justifyContent: "space-between",
    padding: "8px 0",
    borderBottom: "1px solid #f1f5f9",
  },
  label:  { color: "#64748b", fontSize: "13px" },
  valor:  { color: "#1e293b", fontSize: "13px", fontWeight: "500", textAlign: "right", maxWidth: "60%" },
  campoEdit: {
    display: "flex", flexDirection: "column", gap: 4,
    marginBottom: 12,
  },
  labelEdit: { color: "#64748b", fontSize: "12px", fontWeight: "500" },
  input: {
    padding: "8px 10px", borderRadius: "8px",
    border: "1px solid #cbd5e1", fontSize: "13px",
    color: "#1e293b", outline: "none",
    width: "100%", boxSizing: "border-box",
  },
  editInfo: {
    fontSize: "12px", color: "#64748b",
    backgroundColor: "#f8fafc", padding: "8px 12px",
    borderRadius: "8px", marginBottom: 14,
  },
  btnPrimario: {
    padding: "9px 18px", borderRadius: "8px",
    backgroundColor: "#2563eb", color: "#fff",
    border: "none", cursor: "pointer", fontSize: "13px", fontWeight: "500",
  },
  btnSecundario: {
    padding: "9px 18px", borderRadius: "8px",
    backgroundColor: "#f1f5f9", color: "#64748b",
    border: "1px solid #cbd5e1", cursor: "pointer", fontSize: "13px",
  },
  mensaje: (tipo) => ({
    padding: "8px 12px", borderRadius: "8px",
    marginBottom: 12, fontSize: "13px",
    backgroundColor: tipo === "ok" ? "#dcfce7" : tipo === "error" ? "#fee2e2" : "#f1f5f9",
    color: tipo === "ok" ? "#166534" : tipo === "error" ? "#991b1b" : "#475569",
  }),
};
