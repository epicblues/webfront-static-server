FROM node:12

WORKDIR /app

COPY package*.json ../.env ./

RUN npm install

COPY . .

ENV PORT=5000

EXPOSE 5000

CMD ["npm", "run", "dev"]
