FROM node:12.18-alpine AS builder

WORKDIR /opt/web
COPY ./package.json .
RUN npm install

ENV PATH="./node_modules/.bin:$PATH"

COPY . ./
RUN npm run build

# => Run container
FROM nginx:1.21.0-alpine

# Nginx config
RUN rm -rf /etc/nginx/conf.d
COPY nginx /etc/nginx

# Static build
COPY --from=builder /opt/web/build /usr/share/nginx/html

# Default port exposure
EXPOSE 8080

#bash add
RUN apk add --no-cache bash

# Start Nginx server
CMD ["/bin/sh", "-c", "nginx -g \"daemon off;\""]
