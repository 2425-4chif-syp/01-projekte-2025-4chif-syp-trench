FROM node:22.12.0-alpine AS build
WORKDIR /app
RUN rm -rf ./*
COPY package*.json ./
RUN npm install
RUN npx ngcc --properties es2023 browser module main --first-only --create-ivy-entry-points
COPY . .
RUN npm run build
FROM nginx:stable
COPY --from=build /app/dist/asc-visualization/ /usr/share/nginx/html
EXPOSE 80
