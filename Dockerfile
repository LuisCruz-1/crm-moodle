FROM node:22-alpine AS frontend
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY resources ./resources
COPY public ./public
COPY vite.config.* ./
COPY postcss.config.* ./
COPY tailwind.config.* ./
COPY jsconfig.json ./
RUN npm run build

FROM composer:2 AS vendor
WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-dev --prefer-dist --no-interaction --no-progress --no-scripts

FROM php:8.3-fpm-alpine
WORKDIR /var/www/html

RUN apk add --no-cache \
    bash \
    curl \
    icu-libs \
    libpng \
    libjpeg-turbo \
    freetype \
    libzip \
    oniguruma \
    nginx \
    supervisor \
  && apk add --no-cache --virtual .build-deps \
    $PHPIZE_DEPS \
    icu-dev \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    libzip-dev \
  && docker-php-ext-configure gd --with-freetype --with-jpeg \
  && docker-php-ext-install -j$(nproc) bcmath intl mbstring pdo_mysql zip gd opcache pcntl \
  && pecl install redis \
  && docker-php-ext-enable redis \
  && apk del .build-deps

COPY . /var/www/html
COPY --from=vendor /app/vendor /var/www/html/vendor
COPY --from=frontend /app/public/build /var/www/html/public/build

COPY docker/nginx.conf /etc/nginx/http.d/default.conf
COPY docker/php.ini /usr/local/etc/php/conf.d/99-app.ini
COPY docker/start.sh /start.sh
RUN chmod +x /start.sh \
  && mkdir -p /run/nginx \
  && chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

EXPOSE 80
CMD ["/start.sh"]
