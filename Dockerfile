FROM node:alpine3.11
WORKDIR /app

COPY src ./src/
COPY package.json package-lock.json tsconfig.json ./

RUN npm ci

ENTRYPOINT ["node", "--loader", "@k-foss/ts-esnode", "--experimental-specifier-resolution=node", "/app"]