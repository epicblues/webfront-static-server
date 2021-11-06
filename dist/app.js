"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var dotenv_1 = __importDefault(require("dotenv"));
var express_1 = __importDefault(require("express"));
var cors_1 = __importDefault(require("cors"));
var imageRouter_1 = __importDefault(require("./routes/imageRouter"));
var dotenvConfig = dotenv_1.default.config();
var app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.static("public"));
app.use("/image", imageRouter_1.default);
app.get("/", function (req, res) {
    console.log(req);
    res.status(200).json({ message: "main page nodemon" });
});
var PORT = process.env.PORT || 3000;
app.listen(PORT, function () {
    console.log("listening on port : " + PORT);
});
//# sourceMappingURL=app.js.map