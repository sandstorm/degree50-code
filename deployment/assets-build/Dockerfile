FROM node:12.16.3

RUN yarn config set cache-folder /app/.yarn-cache

WORKDIR /app

CMD yarn install && yarn encore dev --watch
