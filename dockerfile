FROM node:carbon-alpine
WORKDIR /server
ENV PORT=1337 \
    TZ=Europe/Warsaw \
    NODE_ENV=production \
    LOG_LEVEL=warn
EXPOSE $PORT
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime \
 && echo $TZ > /etc/timezone \
 && apk add --no-cache tini
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "/server/src/index.js"]
COPY ./package.json \
     ./yarn.lock \
     ./
RUN yarn install --production \
 && yarn cache clean
COPY ./src src
