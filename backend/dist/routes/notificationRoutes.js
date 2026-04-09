"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const notificationController_1 = require("../controllers/notificationController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.use(auth_1.authenticate);
router.get("/", notificationController_1.getNotifications);
router.patch("/:id/read", notificationController_1.markAsRead);
router.post("/subscribe", notificationController_1.subscribe);
router.post("/unsubscribe", notificationController_1.unsubscribe);
exports.default = router;
//# sourceMappingURL=notificationRoutes.js.map