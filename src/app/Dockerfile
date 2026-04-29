FROM node:24-alpine

WORKDIR /app

COPY package.json package-lock.json tsconfig.json ./
RUN npm ci

COPY *.ts ./

EXPOSE 3000

CMD ["npm", "run", "dev"]
