FROM node:14-alpine

WORKDIR /opt/Twitter-Source-Bot

COPY . .

RUN npm install

EXPOSE 1337
EXPOSE 5000
EXPOSE 3000