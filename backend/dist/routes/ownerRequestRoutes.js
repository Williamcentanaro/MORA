"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ownerRequestController_1 = require("../controllers/ownerRequestController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.use(auth_1.authenticate);
router.post("/", ownerRequestController_1.submitRequest);
router.get("/me", ownerRequestController_1.getMyRequest);
exports.default = router;
//# sourceMappingURL=ownerRequestRoutes.js.map