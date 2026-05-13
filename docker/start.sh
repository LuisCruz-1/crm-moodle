#!/usr/bin/env sh
set -e

mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views bootstrap/cache storage/logs
chown -R www-data:www-data storage bootstrap/cache
chmod -R ug+rwX storage bootstrap/cache

php artisan config:clear || true
php artisan route:clear || true
php artisan view:clear || true

php-fpm -D
nginx -g 'daemon off;'
