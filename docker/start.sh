#!/usr/bin/env sh
set -e

mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views bootstrap/cache storage/logs

php artisan config:clear || true
php artisan route:clear || true
php artisan view:clear || true

php-fpm -D
nginx -g 'daemon off;'
