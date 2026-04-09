"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const adminController_1 = require("../controllers/adminController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Apply admin protection to all routes in this router
router.use(auth_1.authenticate);
router.use(auth_1.isAdmin);
router.get("/stats", adminController_1.getStats);
router.get("/restaurants/pending", adminController_1.getPendingRestaurants);
router.patch("/restaurants/:id/approve", adminController_1.approveRestaurant);
router.patch("/restaurants/:id/reject", adminController_1.rejectRestaurant);
router.get("/owner-requests/pending", adminController_1.getPendingOwnerRequests);
router.patch("/owner-requests/:id/approve", adminController_1.approveOwnerRequest);
router.patch("/owner-requests/:id/reject", adminController_1.rejectOwnerRequest);
exports.default = router;
//# sourceMappingURL=adminRoutes.js.map