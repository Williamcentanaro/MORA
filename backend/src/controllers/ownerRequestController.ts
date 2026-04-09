import type { NextFunction } from "express";
import type { Response } from 'express';
import prisma from '../config/prisma';
import type { AuthRequest } from '../middleware/auth';

export const submitRequest = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
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
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            res.status(404).json({ message: 'Utente non trovato' });
            return;
        }

        // Check if user already has a request
        const existingRequest = await prisma.ownerRequest.findUnique({
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

        const ownerRequest = await prisma.ownerRequest.upsert({
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
    } catch (error: any) {
        console.error('Error in submitRequest:', error);
        res.status(500).json({ 
            message: 'Errore interno durante l\'invio della richiesta', 
            error: error.message || 'Unknown error'
        });
    }
};

export const getMyRequest = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const request = await prisma.ownerRequest.findUnique({
            where: { userId }
        });

        res.json(request);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching owner request', error });
    }
};
