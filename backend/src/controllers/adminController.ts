import type { NextFunction } from "express";
import type { Response } from 'express';
import prisma from '../config/prisma';
import type { AuthRequest } from '../middleware/auth';

export const getPendingRestaurants = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const restaurants = await prisma.restaurant.findMany({
            where: { status: 'PENDING' }
        });
        res.json(restaurants);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching pending restaurants', error });
    }
};

export const approveRestaurant = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    try {
        const restaurant = await prisma.restaurant.update({
            where: { id: id as string },
            data: { status: 'APPROVED' }
        });
        res.json({ message: 'Restaurant approved successfully', restaurant });
    } catch (error) {
        res.status(500).json({ message: 'Error approving restaurant', error });
    }
};

export const rejectRestaurant = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    try {
        const restaurant = await prisma.restaurant.update({
            where: { id: id as string },
            data: { status: 'REJECTED' }
        });
        res.json({ message: 'Restaurant rejected successfully', restaurant });
    } catch (error) {
        res.status(500).json({ message: 'Error rejecting restaurant', error });
    }
};

export const getPendingOwnerRequests = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const requests = await prisma.ownerRequest.findMany({
            where: { status: 'PENDING' },
            include: { user: { select: { name: true, email: true } } }
        });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching owner requests', error });
    }
};

export const approveOwnerRequest = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    try {
        const request = await prisma.ownerRequest.findUnique({ where: { id: id as string } });
        if (!request) {
            res.status(404).json({ message: 'Request not found' });
            return;
        }

        // Update request status and user role in a transaction
        await prisma.$transaction([
            prisma.ownerRequest.update({
                where: { id: id as string },
                data: { status: 'APPROVED' }
            }),
            prisma.user.update({
                where: { id: request.userId },
                data: { role: 'OWNER' }
            })
        ]);

        res.json({ message: 'Owner request approved. User is now an OWNER.' });
    } catch (error) {
        res.status(500).json({ message: 'Error approving owner request', error });
    }
};

export const rejectOwnerRequest = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    try {
        await prisma.ownerRequest.update({
            where: { id: id as string },
            data: { status: 'REJECTED' }
        });
        res.json({ message: 'Owner request rejected successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error rejecting owner request', error });
    }
};

export const getStats = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const [totalUsers, totalRestaurants, pendingRestaurants, pendingOwnerRequests] = await prisma.$transaction([
            prisma.user.count(),
            prisma.restaurant.count(),
            prisma.restaurant.count({ where: { status: 'PENDING' } }),
            prisma.ownerRequest.count({ where: { status: 'PENDING' } })
        ]);

        res.json({
            totalUsers,
            totalRestaurants,
            pendingRestaurants,
            pendingOwnerRequests
        });
    } catch (error) {
        next(error);
    }
};
