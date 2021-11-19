import winston from "winston";

const now = new Date();

const nowString = `${now.getFullYear()}${
  now.getMonth() + 1
}${now.getDate()}${now.getHours()}${now.getMinutes()}`;

export const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),

  transports: [
    new winston.transports.File({
      filename: `./public/static/log/${nowString}_error.log`,
      level: "error",
    }),
    new winston.transports.File({
      filename: `./public/static/log/${nowString}_combined.log`,
    }),
  ],
});
