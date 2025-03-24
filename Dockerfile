FROM node:22-alpine

WORKDIR /app

COPY Client/package*.json ./Client/
RUN cd Client && npm install

COPY Server/package*.json ./Server/
RUN cd Server && npm install

COPY . .

WORKDIR /app/Client
RUN npm run build

WORKDIR /app/Server

EXPOSE 3000

CMD ["node", "server.js"]