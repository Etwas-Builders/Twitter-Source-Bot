FROM node:14-alpine

WORKDIR /opt/Twitter-Source-Bot

COPY . .

RUN npm install

RUN apk add --no-cache --virtual .build-deps gcc musl-dev
RUN apk add python3
# RUN sh Python/install.sh
# RUN apk del .build-deps

EXPOSE 1337 5000 3000