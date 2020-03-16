FROM node:alpine3.11
WORKDIR /app

COPY src ./src/
COPY package.json package-lock.json tsconfig.json ./

RUN npm ci

ENTRYPOINT ["node", "--loader", "/app/node_modules/@k-foss/ts-esnode/out/dist/index.js", "--experimental-specifier-resolution=node", "/app"]