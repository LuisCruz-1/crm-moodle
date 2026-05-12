## 1. Arquitectura
- Monolito Laravel 11 con Inertia + React.
- MySQL como fuente de verdad interna.
- Moodle como LMS externo sincronizado; integración vía REST.
- Redis para colas (jobs) y cache.
- Scheduler para sincronización, morosidad y recordatorios.

## 2. Dominios y límites
- CRM: pipelines, stages, leads, historial.
- Académico: espejo local de cursos/categorías/cohortes/usuarios Moodle.
- Estudiantes: entidad estudiante, enrollments/matrículas.
- Finanzas: plantillas por curso, cuotas, pagos, comprobantes, métodos/monedas.
- Bridge: jobs y servicios de ejecución Moodle.
- Comunicaciones: plantillas y eventos de notificación.
- Settings/RBAC/Auditoría: transversal.

## 3. Modelo de datos (resumen)
- Pagos parciales:
  - `installments` contiene `amount` y `balance`.
  - `payments` permite múltiples filas por `installment_id`.
  - En aprobación de pago: se descuenta del `balance`.
  - Cuando `balance` llega a 0 → estado `paid`.
- Control de doble envío de comprobantes:
  - Regla: una cuota no puede tener más de un `payment_submission` en estado `in_review`.

## 4. Integración Moodle
- Config Moodle en DB cifrada (URL, token REST, claves SSO).
- Sincronización:
  - Manual (acción UI) y automática (scheduler cada N horas).
  - Importa categorías, cursos, cohortes/grupos, usuarios.
- Acciones transaccionales (en colas):
  - Crear usuario.
  - Matricular a curso (y asociar a cohorte/grupo si aplica).
  - Cambiar estado de matrícula (0 activo / 1 suspendido).
- Idempotencia:
  - Jobs deben ser reintentables (tries) y tolerar repetición (verificar si ya existe user/enrollment).

## 5. Eventos clave
- Conversión de lead (gate): valida datos → dispara batch de jobs.
- Cuota a overdue: dispara suspensión en Moodle.
- Aprobación de pago: recalcula saldos → posible reactivación.
- Scheduler diario: overdue + recordatorios de vencimiento.

## 6. Seguridad
- Webhooks de leads: autenticación por firma HMAC o token rotativo.
- RBAC en backoffice.
- Archivos de comprobantes en storage privado, acceso controlado.
- No persistir secretos en repositorio; todo por `.env` + settings cifrados.

## 7. Despliegue (Docker + Traefik)
- Servicios: `app`, `db` (mysql8), `redis`, `worker`, `scheduler`.
- Traefik gestiona TLS y routing por host (crm y portal).
- Volúmenes persistentes:
  - DB (`/var/lib/mysql`).
  - Storage privado (`storage/app/private`).

