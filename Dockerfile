# Node server
FROM node:12-alpine as node-server
WORKDIR /usr/src/app
COPY . .
RUN npm install -g .
