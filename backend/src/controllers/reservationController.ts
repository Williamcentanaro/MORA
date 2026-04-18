import type { Request, Response, NextFunction } from "express";
import prisma from "../config/prisma";
import emailService from "../services/emailService";

export const createReservation = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id: restaurantId } = req.params;
        const { name, email, phone, guests, date, time, notes } = req.body;
        const userId = (req as any).user?.id;

        if (!name || !email || !phone || !guests || !date || !time) {
            res.status(400).json({ message: "Campi obbligatori mancanti" });
            return;
        }

        // 1. Fetch restaurant and owner email
        console.log(`[RESERVATION-DIAG] Processing for restaurant: ${restaurantId}`);
        
        const restaurantIdStr = restaurantId as string;
        const restaurant = await prisma.restaurant.findUnique({
            where: { id: restaurantIdStr },
            include: {
                owner: {
                    select: { email: true, name: true }
                }
            }
        });

        if (!restaurant) {
            console.warn(`[RESERVATION-DIAG] Restaurant not found: ${restaurantId}`);
            res.status(404).json({ message: "Ristorante non trovato" });
            return;
        }

        console.log(`[RESERVATION-DIAG] Restaurant Owner: ${restaurant.owner?.email || 'N/A'}`);

        // 2. Create reservation in DB
        const guestsNum = parseInt(guests);
        const reservationDateObj = new Date(date);

        if (isNaN(guestsNum)) {
            res.status(400).json({ message: "Numero ospiti non valido" });
            return;
        }

        if (isNaN(reservationDateObj.getTime())) {
            res.status(400).json({ message: "Data non valida" });
            return;
        }

        const reservation = await prisma.reservation.create({
            data: {
                restaurantId: restaurantIdStr,
                userId,
                name,
                email,
                phone,
                guests: guestsNum,
                date: reservationDateObj,
                time,
                notes,
                status: "pending"
            }
        });

        // 3. Send email to owner - Temporarily disabled for build stability
        console.log(`[RESERVATION-SYSTEM] Owner notification temporarily disabled for build stability. Target: ${restaurant.name} (ID: ${restaurantIdStr})`);
        
        /* 
        try {
            if ((restaurant as any).owner?.email) {
                const reservationDate = new Date(date).toLocaleDateString('it-IT');
                const emailHtml = `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                        <h2 style="color: #ff3366;">Nuova richiesta di prenotazione 🍽️</h2>
                        <p>Hai ricevuto una nuova richiesta per <strong>${restaurant.name}</strong>.</p>
                        <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <p><strong>Cliente:</strong> ${name}</p>
                            <p><strong>Persone:</strong> ${guests}</p>
                            <p><strong>Data:</strong> ${reservationDate}</p>
                            <p><strong>Ora:</strong> ${time}</p>
                            <p><strong>Telefono:</strong> <a href="tel:${phone}">${phone}</a></p>
                            <p><strong>Email:</strong> ${email}</p>
                            ${notes ? `<p><strong>Note:</strong> ${notes}</p>` : ''}
                        </div>
                        <p style="color: #666; font-size: 14px;">Contatta il cliente per confermare o declinare la prenotazione.</p>
                    </div>
                `;

                await emailService.sendEmail({
                    to: (restaurant as any).owner.email,
                    subject: `Nuova prenotazione: ${name} - ${reservationDate} @ ${time}`,
                    html: emailHtml
                });
            }
        } catch (emailError) {
            console.error("[RESERVATION] Email delivery failed, but reservation was saved:", emailError);
        }
        */

        res.status(201).json({
            message: "Richiesta inviata. Il locale ti ricontatterà per conferma.",
            reservation
        });
    } catch (error) {
        console.error("Error creating reservation:", error);
        res.status(500).json({ message: "Errore durante l'invio della prenotazione", error });
    }
};

export const getRestaurantReservations = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id: restaurantId } = req.params;
        const ownerId = (req as any).user?.id;

        const restaurantIdStr = restaurantId as string;
        const restaurant = await prisma.restaurant.findUnique({
            where: { id: restaurantIdStr }
        });

        if (!restaurant || restaurant.ownerId !== ownerId) {
            res.status(403).json({ message: "Accesso negato" });
            return;
        }

        const reservations = await prisma.reservation.findMany({
            where: { restaurantId: restaurantIdStr },
            orderBy: { createdAt: 'desc' }
        });

        res.json(reservations);
    } catch (error) {
        next(error);
    }
};
