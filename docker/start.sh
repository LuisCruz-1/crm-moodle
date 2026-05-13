#!/usr/bin/env sh
set -e

ROLE="${1:-${CONTAINER_ROLE:-web}}"

mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views bootstrap/cache storage/logs storage/app/runtime
chown -R www-data:www-data storage bootstrap/cache
chmod -R ug+rwX storage bootstrap/cache

if [ -z "${APP_KEY:-}" ]; then
    if [ -f storage/app/runtime/app_key ]; then
        export APP_KEY="$(cat storage/app/runtime/app_key)"
    else
        LOCK_DIR="storage/app/runtime/app_key_lock"
        if mkdir "$LOCK_DIR" 2>/dev/null; then
            if [ -f storage/app/runtime/app_key ]; then
                export APP_KEY="$(cat storage/app/runtime/app_key)"
            else
                export APP_KEY="$(php artisan key:generate --show)"
                printf "%s" "$APP_KEY" > storage/app/runtime/app_key
                chown www-data:www-data storage/app/runtime/app_key || true
                chmod 660 storage/app/runtime/app_key || true
            fi
            rmdir "$LOCK_DIR" 2>/dev/null || true
        else
            i=0
            while [ "$i" -lt 50 ]; do
                if [ -f storage/app/runtime/app_key ]; then
                    export APP_KEY="$(cat storage/app/runtime/app_key)"
                    break
                fi
                sleep 0.2
                i=$((i + 1))
            done
        fi
    fi
fi

php -r '
$h=getenv("DB_HOST"); $db=getenv("DB_DATABASE"); $u=getenv("DB_USERNAME"); $p=getenv("DB_PASSWORD"); $port=getenv("DB_PORT") ?: 3306;
for ($i=0; $i<60; $i++) { try { new PDO("mysql:host=$h;port=$port;dbname=$db", $u, $p); exit(0); } catch (Throwable $e) { sleep(2); } }
fwrite(STDERR, "db_not_ready\n"); exit(1);
' 

if [ "$ROLE" = "web" ]; then
    php artisan migrate --force

    php artisan db:seed --class=Database\\Seeders\\RolesAndPermissionsSeeder --force || true
    php artisan db:seed --class=Database\\Seeders\\LmsSeeder --force || true
    php artisan db:seed --class=Database\\Seeders\\FinanceCatalogSeeder --force || true
    php artisan db:seed --class=Database\\Seeders\\EmailTemplatesSeeder --force || true
    php artisan db:seed --class=Database\\Seeders\\CrmSeeder --force || true

    if [ "${DEMO_USERS:-false}" = "true" ]; then
        php artisan db:seed --class=Database\\Seeders\\DemoUsersSeeder --force || true
    fi

    php artisan config:clear || true
    php artisan route:clear || true
    php artisan view:clear || true

    php-fpm -D
    nginx -g 'daemon off;'
fi

if [ "$ROLE" = "worker" ]; then
    exec php artisan queue:work redis --sleep=3 --tries=3 --timeout=90
fi

if [ "$ROLE" = "scheduler" ]; then
    exec php artisan schedule:work
fi

exec "$@"
