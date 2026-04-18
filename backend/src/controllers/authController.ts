import type { Request, Response, NextFunction } from "express";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import prisma from '../config/prisma';
import { OAuth2Client } from "google-auth-library";

import emailService from "../services/emailService";
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

const googleClient = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

/**
 * Professional Registration - Phase 8
 * Includes surname, double-submit protection (via frontend), and mandatory email verification.
 */
export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { email, password, name, surname } = req.body;
        console.log(`[AUTH-DIAG] Register attempt - Body:`, { email, name, surname, hasPassword: !!password });

        if (!email || !password || !name) {
            console.warn(`[AUTH-DIAG] Register failed: Missing fields. Email: ${!!email}, Pwd: ${!!password}, Name: ${!!name}`);
            res.status(400).json({ message: 'Dati mancanti. Nome, email e password sono obbligatori.' });
            return;
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            res.status(400).json({ message: 'Questa email è già associata a un account.' });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        
        // Generate Secure Verification Token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name: name || null,
                surname: surname || null,
                role: 'USER',
                emailVerified: false,
                verificationToken,
                verificationTokenExpiry,
            },
        });

        // Send Professional Verification Email
        await emailService.sendVerificationEmail(user.name || "Utente", user.email, verificationToken);

        console.log(`[AUTH-LOG] New user registered: ${email}. Verification email sent.`);
        res.status(201).json({ 
            message: 'Registrazione completata. Ti abbiamo inviato un’email per verificare il tuo account.', 
            userId: user.id 
        });
    } catch (error) {
        console.error("[AUTH-ERROR] Registration Failure:", error);
        res.status(500).json({ message: 'Errore durante la registrazione. Riprova più tardi.' });
    }
};

/**
 * Email Verification Endpoint
 */
export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
    try {
        const { token } = req.query;

        if (!token) {
            res.status(400).json({ message: 'Token di verifica mancante.' });
            return;
        }

        const user = await prisma.user.findUnique({
            where: { verificationToken: token as string }
        });

        if (!user || !user.verificationTokenExpiry || user.verificationTokenExpiry < new Date()) {
            res.status(400).json({ message: 'Link di verifica non valido o scaduto.' });
            return;
        }

        // Activate User
        await prisma.user.update({
            where: { id: user.id },
            data: {
                emailVerified: true,
                verificationToken: null,
                verificationTokenExpiry: null
            }
        });

        // Send Welcome Email (Post-verification)
        await emailService.sendWelcomeEmail(user.name || "Utente", user.email);

        console.log(`[AUTH-LOG] User verified and welcomed: ${user.email}`);
        res.status(200).json({ message: 'Email verificata con successo! Ora puoi accedere.' });
    } catch (error) {
        console.error("[AUTH-ERROR] Verification Failure:", error);
        res.status(500).json({ message: 'Errore durante la verifica email.' });
    }
};

/**
 * Professional Login
 * Blocks unverified accounts to ensure data integrity.
 */
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.password) {
            res.status(401).json({ message: 'Credenziali non valide.' });
            return;
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(401).json({ message: 'Credenziali non valide.' });
            return;
        }

        // Check if Email is Verified
        if (!user.emailVerified) {
            res.status(403).json({ 
                message: 'Il tuo account non è ancora stato verificato. Controlla la tua email.',
                code: 'EMAIL_NOT_VERIFIED'
            });
            return;
        }

        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
            expiresIn: '24h',
        });

        res.json({ token, user: { id: user.id, email: user.email, role: user.role, name: user.name, surname: user.surname, plan: user.plan, avatar: user.avatar } });
    } catch (error) {
        console.error("[AUTH-ERROR] Login Failure:", error);
        res.status(500).json({ message: 'Errore durante l\'accesso.' });
    }
};

export const getMe = async (req: any, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user?.id;
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true, name: true, surname: true, role: true, plan: true, avatar: true }
        });

        if (!user) {
            res.status(404).json({ message: "Utente non trovato." });
            return;
        }

        res.json({ user });
    } catch (error) {
        res.status(500).json({ message: "Errore nel recupero dati utente.", error });
    }
};

/**
 * Professional Profile Update & Password Change
 */
export const updateMe = async (req: any, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user?.id;
        const { name, surname, currentPassword, newPassword } = req.body;
        console.log(`[AUTH-DIAG] UpdateMe attempt - UserID: ${userId}, Body:`, { name, surname, hasCurrent: !!currentPassword, hasNew: !!newPassword });

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            console.warn(`[AUTH-DIAG] UpdateMe failed: User not found. ID: ${userId}`);
            res.status(404).json({ message: "Utente non trovato." });
            return;
        }

        const updateData: any = {};
        if (name) updateData.name = name;
        if (surname) updateData.surname = surname;

        // Secure Password Update logic
        if (newPassword) {
            if (!currentPassword) {
                res.status(400).json({ message: "Inserisci la password attuale per procedere al cambio." });
                return;
            }

            const isMatch = await bcrypt.compare(currentPassword, user.password || "");
            if (!isMatch) {
                res.status(400).json({ message: "Password attuale non corretta." });
                return;
            }

            updateData.password = await bcrypt.hash(newPassword, 12);
        }

        if (Object.keys(updateData).length === 0) {
            res.status(400).json({ message: "Nessun dato da aggiornare." });
            return;
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: { id: true, name: true, surname: true, email: true }
        });

        res.json({ message: "Profilo aggiornato con successo.", user: updatedUser });
    } catch (error) {
        res.status(500).json({ message: "Errore durante l'aggiornamento del profilo.", error });
    }
};

/**
 * Professional Password Reset Flow
 */
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email } = req.body;
        
        if (!email) {
            res.status(400).json({ message: "Inserisci un indirizzo email." });
            return;
        }

        const user = await prisma.user.findUnique({ where: { email } });
        
        // Security: Always return a neutral success message even if email doesn't exist
        const neutralMessage = "Se esiste un account associato a questa email, ti abbiamo inviato un link per reimpostare la password.";

        if (!user) {
            console.log(`[AUTH-LOG] Forgot password requested for non-existent email: ${email}`);
            res.status(200).json({ message: neutralMessage });
            return;
        }

        const token = crypto.randomBytes(32).toString('hex');
        const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        await prisma.user.update({
            where: { id: user.id },
            data: { resetToken: token, resetTokenExpiry: expiry }
        });

        const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;
        console.log(`[AUTH-LOG] Attempting to send reset email to: ${user.email}`);
        
        const emailSent = await emailService.sendPasswordResetEmail(user.email, resetLink);
        
        if (emailSent) {
            console.log(`[AUTH-LOG] Password reset email sent successfully to ${email}`);
        } else {
            console.error(`[AUTH-LOG] Failed to send password reset email to ${email}`);
        }

        res.status(200).json({ message: neutralMessage });
    } catch (error) {
        console.error("[AUTH-ERROR] Forgot Password Failure:", error);
        res.status(500).json({ message: "Errore durante l'elaborazione della richiesta." });
    }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
        const { token, newPassword } = req.body;
        console.log(`[AUTH-DIAG] ResetPassword attempt - Token: ${token ? 'Present' : 'Missing'}, Pwd: ${newPassword ? 'Present' : 'Missing'}`);

        if (!token || !newPassword) {
            res.status(400).json({ message: "Dati mancanti." });
            return;
        }

        const user = await prisma.user.findUnique({
            where: { resetToken: token }
        });

        if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
            res.status(400).json({ message: "Link di ripristino non valido o scaduto." });
            return;
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12);
        
        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null
            }
        });

        console.log(`[AUTH-LOG] Password reset successful for user: ${user.email}`);
        res.status(200).json({ message: "Password aggiornata con successo. Ora puoi accedere con le nuove credenziali." });
    } catch (error) {
        console.error("[AUTH-ERROR] Reset Password Failure:", error);
        res.status(500).json({ message: "Errore durante il ripristino della password." });
    }
};

/**
 * Classic Google OAuth - Step 1: Redirect to Google
 */
export const startGoogleAuth = (req: Request, res: Response) => {
    const authUrl = googleClient.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email'],
        redirect_uri: process.env.GOOGLE_REDIRECT_URI as string
    });
    console.log("[GOOGLE-LOG] Initiating Google Auth Redirect");
    res.redirect(authUrl);
};

/**
 * Classic Google OAuth - Step 2: Callback handling
 */
export const handleGoogleCallback = async (req: Request, res: Response) => {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    
    try {
        const { code } = req.query;
        if (!code) {
            res.redirect(`${frontendUrl}/login?error=no_code`);
            return;
        }

        const { tokens } = await googleClient.getToken({
            code: code as string,
            redirect_uri: process.env.GOOGLE_REDIRECT_URI as string
        });

        googleClient.setCredentials(tokens);

        if (!tokens.id_token) {
            res.redirect(`${frontendUrl}/login?error=no_id_token`);
            return;
        }

        const ticket = await googleClient.verifyIdToken({
            idToken: tokens.id_token,
            audience: process.env.GOOGLE_CLIENT_ID as string,
        });
        const payload = ticket.getPayload();

        if (!payload || !payload.email) {
            res.redirect(`${frontendUrl}/login?error=invalid_payload`);
            return;
        }

        console.log(`[GOOGLE-OK] Searching for user with email: ${payload.email} or googleId: ${payload.sub}`);
        let user = await prisma.user.findFirst({ 
            where: { OR: [{ googleId: payload.sub }, { email: payload.email }] } 
        });

        if (user) {
            console.log(`[GOOGLE-OK] Existing user found: ${user.id}`);
            // If they registered with email previously or have a different googleId, link/update it
            if (!user.googleId || user.googleId !== payload.sub) {
                console.log(`[GOOGLE-OK] Linking/Updating googleId for user: ${user.id}`);
                user = await prisma.user.update({
                    where: { id: user.id },
                    data: { 
                        googleId: payload.sub, 
                        avatar: payload.picture || user.avatar, 
                        emailVerified: true 
                    }
                });
            }
        } else {
            console.log(`[GOOGLE-OK] No user found. Creating new user record for: ${payload.email}`);
            user = await prisma.user.create({
                data: {
                    email: payload.email,
                    name: payload.name || null,
                    googleId: payload.sub,
                    avatar: payload.picture || null,
                    role: 'USER',
                    emailVerified: true,
                }
            });
            console.log(`[GOOGLE-OK] New user created: ${user.id}. Scheduling welcome email.`);
            
            // Welcome email sent ONLY on creation
            emailService.sendWelcomeEmail(user.name || "Utente Google", user.email).catch(e => {
                console.error(`[GOOGLE-EMAIL-ERR] Failed to send welcome email to ${payload.email}:`, e.message);
            });
        }

        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
            expiresIn: '24h',
        });

        console.log(`[GOOGLE-OK] Auth successful for ${user.email}. Redirecting to frontend.`);
        res.redirect(`${frontendUrl}/?token=${token}`);
    } catch (error) {
        console.error("[GOOGLE-ERROR] Auth Redirect Exception:", error);
        res.redirect(`${frontendUrl}/login?error=google_auth_failed`);
    }
};

/**
 * Classic Facebook OAuth - Step 1: Redirect to Facebook
 */
export const startFacebookAuth = (req: Request, res: Response) => {
    const appId = process.env.FACEBOOK_APP_ID;
    const redirectUri = process.env.FACEBOOK_REDIRECT_URI;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    
    if (!appId || !redirectUri) {
        console.error("[AUTH-FB-ERROR] Facebook configuration missing in .env");
        res.redirect(`${frontendUrl}/login?error=fb_config_missing`);
        return;
    }

    const fbAuthUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=email,public_profile&auth_type=rerequest`;
    
    console.log("[AUTH-FB-LOG] Initiating Facebook Auth Redirect - Scope: [email, public_profile]");
    res.redirect(fbAuthUrl);
};

/**
 * Classic Facebook OAuth - Step 2: Callback handling
 */
export const handleFacebookCallback = async (req: Request, res: Response) => {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    
    try {
        console.log("[AUTH-FB-LOG] Facebook Callback reached");
        const { code } = req.query;
        
        if (!code) {
            console.warn("[AUTH-FB-WARN] Callback reached without code");
            res.redirect(`${frontendUrl}/login?error=no_code`);
            return;
        }

        const appId = process.env.FACEBOOK_APP_ID;
        const appSecret = process.env.FACEBOOK_APP_SECRET;
        const redirectUri = process.env.FACEBOOK_REDIRECT_URI;

        const tokenRes = await fetch(`https://graph.facebook.com/v19.0/oauth/access_token?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri!)}&client_secret=${appSecret}&code=${code}`);
        const tokenData = await tokenRes.json();

        if (tokenData.error) {
            console.error("[AUTH-FB-ERROR] Token Exchange Failed:", tokenData.error.message);
            res.redirect(`${frontendUrl}/login?error=fb_token_failed`);
            return;
        }

        const accessToken = tokenData.access_token;

        const permRes = await fetch(`https://graph.facebook.com/me/permissions?access_token=${accessToken}`);
        const permData = await permRes.json();
        const grantedPerms = permData.data?.filter((p: any) => p.status === 'granted').map((p: any) => p.permission) || [];
        console.log("[AUTH-FB-DIAG] Permissions granted by Meta:", grantedPerms.join(", "));

        const userRes = await fetch(`https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${accessToken}`);
        const fbData = await userRes.json();

        const hasEmail = !!fbData.email;
        if (!hasEmail || fbData.email === "") {
            const emailPerm = permData.data?.find((p: any) => p.permission === 'email');
            const errorReason = emailPerm?.status === 'declined' ? "fb_email_permission_denied" : "fb_email_unverified_or_absent";
            res.redirect(`${frontendUrl}/login?error=${errorReason}`);
            return;
        }

        console.log(`[AUTH-FB-DIAG] Searching for user with id: ${fbData.id} or email: ${fbData.email}`);
        let user = await prisma.user.findFirst({ 
            where: { OR: [{ facebookId: fbData.id }, { email: fbData.email }] } 
        });

        if (user) {
            console.log(`[AUTH-FB-OK] Existing user found: ${user.id}`);
            if (!user.facebookId || user.facebookId !== fbData.id) {
                console.log(`[AUTH-FB-OK] Linking facebookId for user: ${user.id}`);
                user = await prisma.user.update({
                    where: { id: user.id },
                    data: { 
                        facebookId: fbData.id, 
                        avatar: fbData.picture?.data?.url || user.avatar,
                        emailVerified: true
                    }
                });
            }
        } else {
            console.log(`[AUTH-FB-OK] No user found. Creating new user record for: ${fbData.email}`);
            user = await prisma.user.create({
                data: {
                    email: fbData.email,
                    name: fbData.name || null,
                    facebookId: fbData.id,
                    avatar: fbData.picture?.data?.url || null,
                    role: 'USER',
                    emailVerified: true,
                }
            });
            console.log(`[AUTH-FB-OK] New user created: ${user.id}. Scheduling welcome email.`);
            
            // Welcome email sent ONLY on creation
            emailService.sendWelcomeEmail(user.name || "Utente Facebook", user.email).catch(e => {
                console.error(`[AUTH-FB-EMAIL-ERR] Failed to send welcome email to ${fbData.email}:`, e.message);
            });
        }

        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
            expiresIn: '24h',
        });

        console.log(`[AUTH-FB-OK] Auth successful for ${user.email}. Redirecting to frontend.`);
        res.redirect(`${frontendUrl}/?token=${token}`);
    } catch (error: any) {
        console.error("[AUTH-FB-ERROR] Unexpected callback error:", error.message);
        res.redirect(`${frontendUrl}/login?error=fb_auth_failed`);
    }
};
