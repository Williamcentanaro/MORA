"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyRequest = exports.submitRequest = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const submitRequest = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const { businessName, city, message } = req.body;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        if (!businessName || !city) {
            res.status(400).json({ message: 'Business name and city are required' });
            return;
        }
        // Verify user exists in database
        const user = await prisma_1.default.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            res.status(404).json({ message: 'Utente non trovato' });
            return;
        }
        // Check if user already has a request
        const existingRequest = await prisma_1.default.ownerRequest.findUnique({
            where: { userId }
        });
        if (existingRequest) {
            if (existingRequest.status === 'PENDING') {
                res.status(400).json({
                    message: 'Hai già una richiesta in attesa di approvazione.',
                    request: existingRequest
                });
                return;
            }
            if (existingRequest.status === 'APPROVED') {
                res.status(400).json({
                    message: 'Sei già un partner approvato.',
                    request: existingRequest
                });
                return;
            }
            // If REJECTED, we allow them to resubmit (the upsert below will handle this)
        }
        const ownerRequest = await prisma_1.default.ownerRequest.upsert({
            where: { userId },
            create: {
                userId,
                businessName,
                city,
                message,
                status: 'PENDING'
            },
            update: {
                businessName,
                city,
                message,
                status: 'PENDING'
            }
        });
        res.status(201).json({
            message: 'Richiesta inviata con successo',
            request: ownerRequest
        });
    }
    catch (error) {
        console.error('Error in submitRequest:', error);
        res.status(500).json({
            message: 'Errore interno durante l\'invio della richiesta',
            error: error.message || 'Unknown error'
        });
    }
};
exports.submitRequest = submitRequest;
const getMyRequest = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        const request = await prisma_1.default.ownerRequest.findUnique({
            where: { userId }
        });
        res.json(request);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching owner request', error });
    }
};
exports.getMyRequest = getMyRequest;
//# sourceMappingURL=ownerRequestController.js.map