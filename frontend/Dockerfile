FROM node:22.12.0-alpine AS build
WORKDIR /app
RUN rm -rf ./*
COPY package*.json ./
RUN npm install
RUN npx ngcc --properties es2023 browser module main --first-only --create-ivy-entry-points
COPY . .
RUN npm run build --prod
FROM nginx:stable
COPY --from=build /app/dist/asc-visualization/browser/ /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
