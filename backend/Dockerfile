FROM node:22-alpine as build

WORKDIR /app

COPY package.json .
COPY yarn.lock .

RUN yarn install

COPY . .

RUN yarn build

#---

FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY package.json .
COPY yarn.lock .
COPY ormconfig.js .

RUN yarn install --production

COPY --from=build /app/dist ./dist

EXPOSE 5000

ENTRYPOINT [ "yarn", "start:prod" ]