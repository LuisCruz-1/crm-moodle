## Deploy en VPS Hostinger (con Traefik ya instalado)

Este proyecto está pensado para que tu VPS tenga Traefik ya funcionando y que esta app solo “se cuelgue” a la red externa (`traefik-public`).

Hay 2 formas típicas de subir el código al VPS: con `git clone` (recomendado) o descargando el ZIP de GitHub (como lo hacías antes).

### 1) Preparar carpeta del proyecto
```bash
mkdir -p /opt/crm-academico
cd /opt/crm-academico
```

### 2A) Subir código con Git (recomendado)
```bash
git clone <TU_REPO_GIT> .
```

### 2B) Subir código descargando ZIP (alternativa)
```bash
apt update
apt install -y unzip
```

Descarga el ZIP del repo (desde GitHub) y súbelo al VPS (SFTP) o descárgalo con `wget/curl`.

Luego:
```bash
unzip repo.zip
```

Si el ZIP extrae a una carpeta (ej. `crm-academico-main/`), mueve su contenido a la raíz del proyecto:
```bash
mv crm-academico-main/* .
mv crm-academico-main/.* . 2>/dev/null || true
rmdir crm-academico-main
```

### 2) Crear `.env` (no subir al repo)
```bash
cp .env.example .env
```

Edita estos valores como mínimo:
- `APP_NAME`
- `APP_ENV=production`
- `APP_DEBUG=false`
- `APP_URL=https://<tu-dominio>`
- `APP_KEY` (se genera luego)
- `CRM_HOST=crm.tuacademia.com`
- `PORTAL_HOST=alumnos.tuacademia.com`
- `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`, `DB_ROOT_PASSWORD`
- SMTP (`MAIL_*`) para notificaciones

### 3) DNS/Subdominios (antes de levantar)
Crea los registros DNS tipo **A** apuntando a la IP de tu VPS:
- `CRM_HOST` (ej. `crm.tuacademia.com`)
- `PORTAL_HOST` (ej. `alumnos.tuacademia.com`)

Traefik debe tener acceso a esos hosts y emitir certificado (Let’s Encrypt) con el resolver que uses.

### 4) Verificar que exista la red externa de Traefik
La red debe existir (ej. `traefik-public`). Si tu Traefik usa otro nombre, cambia `docker-compose.yml`.

### 5) Levantar servicios (CLI)
```bash
docker compose up -d --build
```

### 6) Generar APP_KEY y correr migraciones/seed
```bash
docker compose exec app php artisan key:generate
docker compose exec app php artisan migrate --force
```

Si hay seeders base:
```bash
docker compose exec app php artisan db:seed --force
```

### 7) Permisos de storage
Si tu VPS lo requiere:
```bash
docker compose exec app chown -R www-data:www-data storage bootstrap/cache
```

### 8) Actualizar código
```bash
git pull
docker compose up -d --build
docker compose exec app php artisan migrate --force
```

---

## Deploy usando “Docker Manager” (pegando YAML + Environment)
Si vas a crear el proyecto/stack desde una UI (Docker Manager/Portainer/Hostinger), el flujo suele ser:

1) Crea la carpeta del proyecto en el VPS y sube el repo (por Git o ZIP).
2) Abre el administrador Docker y crea un **Stack/Compose Project**.
3) En la pestaña **YAML**, pega el contenido de `docker-compose.yml`.
4) En la pestaña **Environment**, define variables (mínimas):
   - `APP_ENV=production`
   - `APP_DEBUG=false`
   - `APP_URL=https://<tu-dominio>`
   - `CRM_HOST=crm.tuacademia.com`
   - `PORTAL_HOST=alumnos.tuacademia.com`
   - `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`, `DB_ROOT_PASSWORD`
   - `MAIL_*`
   - Opcional Traefik: `TRAEFIK_ENTRYPOINT` y `TRAEFIK_CERTRESOLVER`
5) Asegúrate de que exista la red externa `traefik-public` (o ajusta el nombre).
6) Despliega el stack.

Después del primer despliegue, entra al contenedor `app` y ejecuta:
```bash
php artisan key:generate
php artisan migrate --force
php artisan db:seed --force
```
