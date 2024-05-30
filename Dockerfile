FROM node:18-alpine3.16 as builder
WORKDIR /app
COPY package.json yarn.lock ./

ENV NODE_OPTIONS=--max-old-space-size=4096

RUN yarn install && yarn cache clean
COPY . .
RUN yarn build

FROM node:18-alpine3.16
ENV NITRO_PORT=5173
WORKDIR /app
COPY --from=builder /app/.output/ .
EXPOSE 5173

ENTRYPOINT ["node", "server/index.mjs"]