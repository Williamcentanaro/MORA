"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStats = exports.rejectOwnerRequest = exports.approveOwnerRequest = exports.getPendingOwnerRequests = exports.rejectRestaurant = exports.approveRestaurant = exports.getPendingRestaurants = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const getPendingRestaurants = async (req, res, next) => {
    try {
        const restaurants = await prisma_1.default.restaurant.findMany({
            where: { status: 'PENDING' }
        });
        res.json(restaurants);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching pending restaurants', error });
    }
};
exports.getPendingRestaurants = getPendingRestaurants;
const approveRestaurant = async (req, res, next) => {
    const { id } = req.params;
    try {
        const restaurant = await prisma_1.default.restaurant.update({
            where: { id: id },
            data: { status: 'APPROVED' }
        });
        res.json({ message: 'Restaurant approved successfully', restaurant });
    }
    catch (error) {
        res.status(500).json({ message: 'Error approving restaurant', error });
    }
};
exports.approveRestaurant = approveRestaurant;
const rejectRestaurant = async (req, res, next) => {
    const { id } = req.params;
    try {
        const restaurant = await prisma_1.default.restaurant.update({
            where: { id: id },
            data: { status: 'REJECTED' }
        });
        res.json({ message: 'Restaurant rejected successfully', restaurant });
    }
    catch (error) {
        res.status(500).json({ message: 'Error rejecting restaurant', error });
    }
};
exports.rejectRestaurant = rejectRestaurant;
const getPendingOwnerRequests = async (req, res, next) => {
    try {
        const requests = await prisma_1.default.ownerRequest.findMany({
            where: { status: 'PENDING' },
            include: { user: { select: { name: true, email: true } } }
        });
        res.json(requests);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching owner requests', error });
    }
};
exports.getPendingOwnerRequests = getPendingOwnerRequests;
const approveOwnerRequest = async (req, res, next) => {
    const { id } = req.params;
    try {
        const request = await prisma_1.default.ownerRequest.findUnique({ where: { id: id } });
        if (!request) {
            res.status(404).json({ message: 'Request not found' });
            return;
        }
        // Update request status and user role in a transaction
        await prisma_1.default.$transaction([
            prisma_1.default.ownerRequest.update({
                where: { id: id },
                data: { status: 'APPROVED' }
            }),
            prisma_1.default.user.update({
                where: { id: request.userId },
                data: { role: 'OWNER' }
            })
        ]);
        res.json({ message: 'Owner request approved. User is now an OWNER.' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error approving owner request', error });
    }
};
exports.approveOwnerRequest = approveOwnerRequest;
const rejectOwnerRequest = async (req, res, next) => {
    const { id } = req.params;
    try {
        await prisma_1.default.ownerRequest.update({
            where: { id: id },
            data: { status: 'REJECTED' }
        });
        res.json({ message: 'Owner request rejected successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error rejecting owner request', error });
    }
};
exports.rejectOwnerRequest = rejectOwnerRequest;
const getStats = async (req, res, next) => {
    try {
        const [totalUsers, totalRestaurants, pendingRestaurants, pendingOwnerRequests] = await prisma_1.default.$transaction([
            prisma_1.default.user.count(),
            prisma_1.default.restaurant.count(),
            prisma_1.default.restaurant.count({ where: { status: 'PENDING' } }),
            prisma_1.default.ownerRequest.count({ where: { status: 'PENDING' } })
        ]);
        res.json({
            totalUsers,
            totalRestaurants,
            pendingRestaurants,
            pendingOwnerRequests
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getStats = getStats;
//# sourceMappingURL=adminController.js.map