"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var dotenv_1 = __importDefault(require("dotenv"));
var express_1 = __importDefault(require("express"));
var cors_1 = __importDefault(require("cors"));
var dotenvConfig = dotenv_1.default.config();
var app = express_1.default();
app.use(express_1.default.static("public"));
app.use(cors_1.default());
var PORT = process.env.PORT || 3000;
app.listen(PORT, function () {
    console.log("listening on port : " + PORT);
});
//# sourceMappingURL=app.js.map