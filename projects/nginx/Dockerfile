# Кастомный nginx = stock nginx:1.28.1 + динамические модули ngx_brotli.
#
# Модули собираются из исходников РОВНО под версию nginx официального образа и с флагом
# --with-compat, поэтому бинарно совместимы со stock-сборкой (load_module не упадёт по ABI).
# Конфиг (nginx.conf) НЕ копируется в образ — он монтируется томом в docker-compose.prod.yml,
# поэтому образ не зависит от содержимого репозитория и контекст сборки минимален.
ARG NGINX_VERSION=1.28.1

# --- build stage: компилируем только модули (make modules) ---
FROM nginx:${NGINX_VERSION} AS build
ARG NGINX_VERSION
# libbrotli-dev — ngx_brotli (HEAD) линкуется против системных libbrotlienc/libbrotlicommon.
RUN apt-get update && apt-get install -y --no-install-recommends \
        git gcc make libpcre2-dev zlib1g-dev libssl-dev libbrotli-dev wget ca-certificates \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /usr/src
RUN git clone --depth=1 --recurse-submodules --shallow-submodules \
        https://github.com/google/ngx_brotli.git \
    && wget -q -O nginx.tar.gz "https://nginx.org/download/nginx-${NGINX_VERSION}.tar.gz" \
    && tar -xzf nginx.tar.gz
WORKDIR /usr/src/nginx-${NGINX_VERSION}
RUN ./configure --with-compat --add-dynamic-module=/usr/src/ngx_brotli \
    && make -j"$(nproc)" modules \
    && cp objs/ngx_http_brotli_filter_module.so objs/ngx_http_brotli_static_module.so \
          /usr/lib/nginx/modules/

# --- final stage: stock nginx + скомпилированные .so + рантайм brotli ---
FROM nginx:${NGINX_VERSION}
# libbrotli1 — рантайм libbrotlienc/libbrotlicommon/libbrotlidec, без него модуль не загрузится.
RUN apt-get update && apt-get install -y --no-install-recommends libbrotli1 \
    && rm -rf /var/lib/apt/lists/*
COPY --from=build /usr/lib/nginx/modules/ngx_http_brotli_filter_module.so /usr/lib/nginx/modules/
COPY --from=build /usr/lib/nginx/modules/ngx_http_brotli_static_module.so /usr/lib/nginx/modules/
