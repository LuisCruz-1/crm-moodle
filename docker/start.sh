#!/usr/bin/env sh
set -e

php artisan config:clear || true
php artisan route:clear || true
php artisan view:clear || true

php-fpm -D
nginx -g 'daemon off;'

