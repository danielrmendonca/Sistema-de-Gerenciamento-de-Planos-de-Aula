# ----------IMAGEM DO FRONTEND (MULTI-STAGE)----------
# Stage 1 (build): instala dependencias e compila o SPA com Vite.
# Stage 2 (runtime): copia apenas o dist gerado para uma imagem nginx alpine,
# resultando em uma imagem final pequena (sem Node nem node_modules)

# ----------STAGE 1: BUILD----------
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ----------STAGE 2: NGINX----------
FROM nginx:alpine

# Substitui a configuracao default do nginx pela nossa, que serve o SPA
# e cai para index.html em rotas client-side (try_files no nginx.conf)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia o build estatico para o diretorio padrao que o nginx serve
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
