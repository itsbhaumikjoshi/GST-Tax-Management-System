FROM node:14.15.4 as base

WORKDIR /usr/src/app

COPY package.json package.json

FROM base as test
RUN yarn
COPY . .
CMD [ "yarn", "test" ]

FROM base as server
RUN yarn
COPY . .
CMD [ "yarn", "start" ]