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

### 4) Traefik: dos escenarios (elige el tuyo)
**Escenario A (Traefik con red Docker compartida)**  
Si tu Traefik corre en modo “normal” (no `network_mode: host`) y se conecta a una red externa (típico `traefik-public`), entonces:
- Asegúrate de que exista la red externa, por ejemplo:
  ```bash
  docker network create traefik-public
  ```
- Mantén `docker-compose.yml` tal cual (usa `traefik-public` como `external: true`).

**Escenario B (Tu caso: Traefik con `network_mode: host`)**  
Si tu Traefik está en `network_mode: host`, no “vive” dentro de redes Docker y es común que NO tengas una red `traefik-public`. En ese caso:
- Usa el compose alternativo: `docker-compose.host-traefik.yml` (no declara red externa).
- En Docker Manager, pega ese YAML en lugar del `docker-compose.yml`.

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
3) En la pestaña **YAML**, pega:
   - `docker-compose.yml` si usas red externa `traefik-public`, o
   - `docker-compose.host-traefik.yml` si tu Traefik está en `network_mode: host`.
4) En la pestaña **Environment**, define variables (mínimas):
   - `APP_ENV=production`
   - `APP_DEBUG=false`
   - `APP_URL=https://<tu-dominio>` (incluye `https://`)
   - `CRM_HOST=crm.tuacademia.com`
   - `PORTAL_HOST=alumnos.tuacademia.com`
   - `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`, `DB_ROOT_PASSWORD`
   - `MAIL_*`
   - Opcional Traefik: `TRAEFIK_ENTRYPOINT` y `TRAEFIK_CERTRESOLVER`
5) Si usas `docker-compose.yml`, asegúrate de que exista la red externa `traefik-public` (o ajusta el nombre). Si usas `docker-compose.host-traefik.yml`, no aplica.
6) Despliega el stack.

Después del primer despliegue, entra al contenedor `app` y ejecuta:
```bash
php artisan key:generate
php artisan migrate --force
php artisan db:seed --force
```

---

## Si tu Docker Manager NO hace `build: .` (tu caso)
En muchos “Docker Managers” cuando pegas YAML, el sistema NO construye imágenes desde `build: .` y por eso verás errores tipo:
- `No such image: <proyecto>-worker:latest`

La solución más estable es desplegar desde una imagen preconstruida (GHCR).

### 1) Publicar imagen automáticamente (una sola vez)
Este repo ya incluye un workflow para construir y publicar la imagen en GitHub Container Registry:
- [ghcr.yml](file:///d:/Proyectos/crm-academico/.github/workflows/ghcr.yml)

Cuando hagas push a `main`, GitHub publicará:
- `ghcr.io/<tu-usuario-o-org>/<tu-repo>:latest`

### 2) YAML listo para pegar (Escenario B + GHCR)
Pega esto como Stack/Compose. Cambia SOLO el `image:` si tu repo no coincide.

```yaml
services:
  app:
    image: ghcr.io/micrudev/crm-academico:latest
    restart: always
    environment:
      APP_NAME: "CRM Académico"
      APP_ENV: production
      APP_DEBUG: "false"
      APP_URL: "https://crm.micrudev.tech"
      DB_CONNECTION: mysql
      DB_HOST: db
      DB_PORT: 3306
      DB_DATABASE: crm_academico
      DB_USERNAME: crm_user
      DB_PASSWORD: "SuperPasswordSecreta123"
      DB_ROOT_PASSWORD: "RootPasswordMuySecreta123"
      REDIS_HOST: redis
      QUEUE_CONNECTION: redis
      CACHE_STORE: redis
      SESSION_DRIVER: redis
      CRM_HOST: "crm.micrudev.tech"
      PORTAL_HOST: "alumnos.micrudev.tech"
      TRAEFIK_ENTRYPOINT: websecure
      TRAEFIK_CERTRESOLVER: letsencrypt
      MAIL_MAILER: log
      MAIL_HOST: "127.0.0.1"
      MAIL_PORT: "2525"
      MAIL_FROM_ADDRESS: "hello@example.com"
      MAIL_FROM_NAME: "CRM Académico"
    volumes:
      - storage_private:/var/www/html/storage/app/private
    depends_on:
      - db
      - redis
    networks:
      - app-network
    labels:
      - traefik.enable=true
      - "traefik.http.routers.crm.rule=Host(`crm.micrudev.tech`,`alumnos.micrudev.tech`)"
      - traefik.http.routers.crm.tls=true
      - traefik.http.routers.crm.entrypoints=websecure
      - traefik.http.routers.crm.tls.certresolver=letsencrypt
      - traefik.http.services.crm.loadbalancer.server.port=80

  worker:
    image: ghcr.io/micrudev/crm-academico:latest
    restart: always
    command: php artisan queue:work redis --sleep=3 --tries=3 --timeout=90
    environment:
      APP_ENV: production
      APP_DEBUG: "false"
      DB_CONNECTION: mysql
      DB_HOST: db
      DB_PORT: 3306
      DB_DATABASE: crm_academico
      DB_USERNAME: crm_user
      DB_PASSWORD: "SuperPasswordSecreta123"
      REDIS_HOST: redis
      QUEUE_CONNECTION: redis
    depends_on:
      - db
      - redis
    networks:
      - app-network

  scheduler:
    image: ghcr.io/micrudev/crm-academico:latest
    restart: always
    command: php artisan schedule:work
    environment:
      APP_ENV: production
      APP_DEBUG: "false"
      DB_CONNECTION: mysql
      DB_HOST: db
      DB_PORT: 3306
      DB_DATABASE: crm_academico
      DB_USERNAME: crm_user
      DB_PASSWORD: "SuperPasswordSecreta123"
      REDIS_HOST: redis
      QUEUE_CONNECTION: redis
    depends_on:
      - db
      - redis
    networks:
      - app-network

  db:
    image: mysql:8.0
    restart: always
    environment:
      MYSQL_DATABASE: crm_academico
      MYSQL_USER: crm_user
      MYSQL_PASSWORD: "SuperPasswordSecreta123"
      MYSQL_ROOT_PASSWORD: "RootPasswordMuySecreta123"
    volumes:
      - db_data:/var/lib/mysql
    networks:
      - app-network

  redis:
    image: redis:alpine
    restart: always
    networks:
      - app-network

networks:
  app-network:
    driver: bridge

volumes:
  db_data:
  storage_private:
```

Después del deploy, ejecuta dentro del contenedor `app`:
```bash
php artisan key:generate
php artisan migrate --force
php artisan db:seed --force
```
