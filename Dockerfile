# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package*.json ./

RUN npm ci

COPY . .

# Build the application
# The output path will be typically dist/HoopStats/browser with the new builder
RUN npm run build   

# Serve stage
FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built application from builder stage
# Adjusting assuming project name "HoopStats" from angular.json
COPY --from=builder /app/dist/HoopStats/browser /usr/share/nginx/html

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
