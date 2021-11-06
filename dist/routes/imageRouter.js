"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var image_1 = require("../controllers/image");
var router = express_1.default.Router();
router.get("/", image_1.main);
exports.default = router;
//# sourceMappingURL=imageRouter.js.map