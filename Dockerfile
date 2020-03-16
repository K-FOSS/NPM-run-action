FROM node:alpine3.11
WORKDIR /app

COPY src ./src/
COPY package.json package-lock.json tsconfig.json ./

RUN npm ci

ENTRYPOINT ["npm", "start"]