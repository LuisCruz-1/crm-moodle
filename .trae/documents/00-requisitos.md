## 1. Objetivo
Construir un sistema integrado CRM + SIS Académico conectado a Moodle, con backoffice operativo (ventas, finanzas, admin) y un portal de autogestión para estudiantes.

## 2. Stack
- Backend/API: Laravel 11
- Frontend: React + Inertia.js (dentro de Laravel)
- DB: MySQL 8
- Colas/Cache: Redis
- Infra: Docker + Traefik (reverse proxy, TLS)

## 3. Módulos funcionales

### 3.1 CRM (Comercial)
- Pipelines múltiples parametrizables.
- Etapas por pipeline con orden drag & drop.
- Definición explícita de una o varias etapas como "Ganado" (disparador de conversión).
- Tablero Kanban por pipeline con drag & drop entre etapas.
- Mover leads entre pipelines.
- Filtros por curso de interés y por vendedor.
- Captura de leads:
  - Manual (formulario).
  - API/Webhooks seguros.
  - Configuración académica obligatoria: curso de interés.
  - Cohorte opcional.
  - Upselling: vinculación opcional a estudiante existente.
- Validation Gate al pasar a etapa Ganada:
  - Validar campos obligatorios para Moodle (apellidos, email válido, DNI/identificación).
  - Confirmación explícita de matrícula + cohorte + creación de deuda según plantilla.
  - Ejecución asíncrona: crear usuario Moodle si aplica, matricular, generar plan de pagos, cerrar lead.

### 3.2 Académico (Bridge de catálogo)
- Sincronización bidireccional con Moodle:
  - Manual (botón).
  - Automática (scheduler cada N horas configurable).
  - Importa: categorías, cursos, cohortes/grupos y usuarios.
- Cohortes opcionales: el alumno puede estar en un curso sin cohorte.
- Plantillas de pago por curso (motor de reglas de cobro).

### 3.3 Estudiantes / Matrícula directa
- Creación manual de estudiante con campos mínimos (nombre, apellidos, email, DNI).
- Al guardar: crear usuario en Moodle inmediatamente.
- Matriculación manual: estudiante existente → curso + cohorte opcional → generar plan de pagos según plantilla.
- Expediente único: datos personales, cursos activos, comunicaciones, estado de cuenta.
- Soft deletes con regla estricta: no permitir borrar si existen pagos aprobados o facturación; usar suspensión en su lugar.

### 3.4 Motor financiero y cobranzas
- Generación automática de cuotas al matricular.
- Cuotas editables: monto base, fecha vencimiento, descuentos con motivo/auditoría, cuotas extraordinarias.
- Pagos parciales: una cuota puede tener múltiples pagos; la cuota se considera pagada cuando el saldo llega a 0.
- Inbox de comprobantes:
  - Estudiante sube imagen/PDF y selecciona método de pago + referencia.
  - Bloqueo de doble envío mientras está en revisión.
  - Agente aprueba/rechaza; en aprobación debe confirmar método exacto.
- Registro de pago manual: obligatorio método y fecha real.
- Cron diario: marcar cuotas vencidas (overdue) al superar due_date.

### 3.5 Moodle Bridge (asíncrono con colas)
- Guardián por mora: al pasar una cuota a vencida, encolar suspensión en Moodle (status=1) por curso.
- Reactivación: al aprobar pagos y quedar al día, reactivar matrícula (status=0).

### 3.6 Comunicaciones y notificaciones
- Correos transaccionales por colas.
- Plantillas editables desde UI.
- Triggers:
  - Bienvenida por matrícula/alta.
  - Recordatorio preventivo X días antes de vencimiento.
  - Recibo al aprobar pago.
  - Alerta inmediata de suspensión por mora.

### 3.7 Portal del estudiante
- SSO contra Moodle (validación en tiempo real vía login/token.php).
- Estado de cuenta (semáforo: pagado/pendiente/vencido).
- Subida de comprobantes con selección de método y referencia.
- Acceso al aula virtual (auto-login); bloqueo si hay mora.

### 3.8 Configuración, seguridad y auditoría
- Moneda base del sistema.
- Métodos de pago administrables (activos/inactivos).
- Config Moodle desde UI (URL, token REST, claves SSO) cifrado en DB.
- RBAC: superadmin, ventas, finanzas.
- Activity logs: aprobar pagos, borrar lead, cambiar fechas/montos, aplicar descuentos.

## 4. Restricciones no funcionales
- Operación asíncrona para acciones hacia Moodle y envío de emails.
- Trazabilidad/auditoría de cambios financieros.
- Persistencia de comprobantes en storage privado.

