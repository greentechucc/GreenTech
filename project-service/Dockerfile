# -- Etapa 1: Construcción (Build) --
FROM node:20-alpine AS builder

# Establecer directorio de trabajo
WORKDIR /usr/src/app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar TODAS las dependencias (necesarias para compilar NestJS)
RUN npm ci

# Copiar todo el código fuente
COPY . .

# Compilar la aplicación (genera la carpeta dist)
RUN npm run build

# Opcional: Eliminar dependencias de desarrollo para ahorrar espacio si fuera necesario
# RUN npm ci --only=production && npm cache clean --force

# -- Etapa 2: Producción (Runtime) --
FROM node:20-alpine AS production

# Establecer el entorno en producción
ENV NODE_ENV=production

# Establecer directorio de trabajo
WORKDIR /usr/src/app

# Copiar paquetes e instalar SOLO las dependencias de producción
COPY package*.json ./
RUN npm ci --only=production

# Copiar la compilación generada en la Etapa 1
COPY --from=builder /usr/src/app/dist ./dist

# Exponer el puerto por el que corre el proyecto (asumimos 3003 o similar dependiendo de su .env)
EXPOSE 3003

# Comando para iniciar la aplicación optimizada
CMD ["node", "dist/main"]
