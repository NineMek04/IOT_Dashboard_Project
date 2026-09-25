# Stage 1: Build
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN npm run build --configuration=production

# Stage 2: Serve with Nginx
FROM nginx:alpine
# หมายเหตุ: เปลี่ยน 'iot-dashboard-frontend' เป็นชื่อโปรเจกต์ใน angular.json ของคุณ
COPY --from=build /app/dist/iot-dashboard-frontend/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]