## Backoffice (Inertia)

### Navegación
- Dashboard
- CRM
  - Pipelines (admin)
  - Kanban
  - Leads (lista / detalle)
- Académico
  - Cursos (lista)
  - Curso detalle (cohortes + plantilla de pago)
  - Sincronización Moodle (manual + estado)
- Estudiantes
  - Lista
  - Crear
  - Detalle (expediente, matrículas, estado de cuenta)
- Finanzas
  - Inbox de comprobantes
  - Cuotas (buscador y edición)
  - Métodos de pago
  - Monedas
  - Tipos de pago
- Comunicaciones
  - Plantillas de correo
  - Logs
- Configuración
  - Integración Moodle
  - Parámetros (frecuencias cron, días de recordatorio, etc.)
- Usuarios y Roles

### Páginas clave
- Kanban CRM: selector de pipeline, columnas por etapa, tarjetas lead, drag & drop.
- Lead detalle: datos, curso/cohorte, asignación, notas, historial de etapas, botón/acción de conversión (gate).
- Curso detalle: cohortes, plantilla de pago (items, cantidad, monto, frecuencia).
- Estudiante detalle: datos, enrollments, cuotas con semáforo, pagos, acciones (matricular, registrar pago manual).
- Inbox comprobantes: tabla con filtros, preview de archivo, aprobar/rechazar con validación.

## Portal alumno (host separado)
- Login SSO Moodle
- Home / Cursos
  - Lista de cursos, botón "Ir al Aula Virtual" (bloqueado si mora)
- Estado de cuenta
  - Cuotas por matrícula/curso con estados
  - Detalle de cuota con historial de pagos parciales
- Subir comprobante
  - Selección de método, referencia, archivo
  - Bloqueo si ya hay envío en revisión

