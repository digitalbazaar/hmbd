FROM node:24-alpine AS base
RUN mkdir -p /home/node/app && chown -R node:node /home/node/app
WORKDIR /home/node/app

FROM base AS build-setup
RUN apk add --no-cache git bash

FROM build-setup AS build
ARG NODE_AUTH_TOKEN
USER node
COPY --chown=node:node . .
RUN mv dev.js index.js
RUN npm i --omit=optional --omit=dev

FROM build AS test
#RUN cd test && npm t
RUN rm -rf test bin

FROM base AS release
COPY --from=test --chown=node:node /home/node/app ./
EXPOSE 10443
ENV NODE_ENV=production
CMD [ "node", "index"]
