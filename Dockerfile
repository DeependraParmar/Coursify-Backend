FROM node:20 AS base

WORKDIR /src/app

RUN npm install -g nodemon

COPY package* .

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]