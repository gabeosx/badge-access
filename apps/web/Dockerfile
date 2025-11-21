FROM node:20-slim AS builder
WORKDIR /app
COPY . .
RUN npm install
RUN npx turbo run build --filter=web...

FROM nginx:alpine
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
