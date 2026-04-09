import express from "express";
import { submitRequest, getMyRequest } from "../controllers/ownerRequestController";
import { authenticate } from "../middleware/auth";

const router = express.Router();

router.use(authenticate);

router.post("/", submitRequest);
router.get("/me", getMyRequest);

export default router;
