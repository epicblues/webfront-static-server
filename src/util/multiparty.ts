import path from "path";
import multiparty from "multiparty";

export const multiHandler = new multiparty.Form({
  uploadDir: path.join("./", "public/static"),
});
