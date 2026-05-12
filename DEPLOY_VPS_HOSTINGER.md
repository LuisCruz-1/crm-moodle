## Deploy en VPS Hostinger (con Traefik ya instalado)

### 1) Preparar carpeta y clonar
```bash
mkdir -p /opt/crm-academico
cd /opt/crm-academico
git clone <TU_REPO_GIT> .
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

### 3) Verificar que exista la red externa de Traefik
La red debe existir (ej. `traefik-public`). Si tu Traefik usa otro nombre, cambia `docker-compose.yml`.

### 4) Levantar servicios
```bash
docker compose up -d --build
```

### 5) Generar APP_KEY y correr migraciones/seed
```bash
docker compose exec app php artisan key:generate
docker compose exec app php artisan migrate --force
```

Si hay seeders base:
```bash
docker compose exec app php artisan db:seed --force
```

### 6) Permisos de storage
Si tu VPS lo requiere:
```bash
docker compose exec app chown -R www-data:www-data storage bootstrap/cache
```

### 7) Actualizar código
```bash
git pull
docker compose up -d --build
docker compose exec app php artisan migrate --force
```

