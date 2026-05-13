## Deploy en VPS Hostinger usando Docker Manager (escenario B: Traefik en `network_mode: host`)

### 0) ¿Tengo que descargar el repo al VPS?
No. Este despliegue usa `image: ...` (no `build: .`), así que el VPS **no necesita** tener el repositorio en disco. Docker Manager descargará la imagen desde el registry y levantará los contenedores.

Requisito: la imagen configurada en [docker-compose.yml](file:///d:/Proyectos/crm-academico/docker-compose.yml) debe existir y ser accesible desde tu VPS (si es privada, debes configurar credenciales del registry en el Docker Manager).

En este proyecto, la imagen esperada es:
- `ghcr.io/luiscruz-1/crm-moodle:latest`

Para que exista, GitHub Actions debe construirla y publicarla en GHCR cuando hagas push a `main`.

### 1) DNS/Subdominios
Crea los registros DNS tipo **A** apuntando a la IP de tu VPS:
- `crm.micrudev.tech`
- `alumnos.micrudev.tech`

### 2) Docker Manager (Hostinger)
1) Crea un **Compose Project**.
2) En la pestaña **YAML**, pega el contenido de [docker-compose.yml](file:///d:/Proyectos/crm-academico/docker-compose.yml).
3) En la pestaña **Environment**, pega el contenido de [.env.example](file:///d:/Proyectos/crm-academico/.env.example).
4) Despliega el proyecto.

### 3) Inicialización (automática)
Al iniciar el contenedor `app`, el sistema ejecuta automáticamente:
- Generación de `APP_KEY` si no está configurada (se guarda en volumen persistente)
- `php artisan migrate --force`
- `php artisan db:seed --force` solo si no existen usuarios (primer arranque)

### 3.1) Usuario admin (creación automática)
El seeder crea automáticamente un usuario superadmin con estas variables:
- `SUPERADMIN_EMAIL`
- `SUPERADMIN_PASSWORD`
- `SUPERADMIN_NAME`

### 4) Actualizaciones
Cuando publiques una nueva versión de la imagen (tag `latest`), en Docker Manager haz un redeploy/pull para que descargue la versión nueva. El contenedor `app` ejecuta `migrate --force` automáticamente al iniciar.

### 5) Si ves `404 page not found` en el dominio
Ese `404 page not found` normalmente viene de Traefik (no de Laravel) y significa que el router no está matcheando el Host o Traefik no “ve” tu contenedor.

Checklist rápida:
- Verifica que los DNS A de `crm.micrudev.tech` y `alumnos.micrudev.tech` apunten a la IP del VPS.
- En el stack, confirma que el contenedor `app` tiene labels `traefik.http.routers.crm-moodle.*`.
- Revisa logs de Traefik para ver si detecta el router y si reporta errores al enrutar.

Nota Traefik v3:
- La regla `Host()` ya no acepta 2 parámetros. La forma correcta es:
  - `Host(\`crm.micrudev.tech\`) || Host(\`alumnos.micrudev.tech\`)`
