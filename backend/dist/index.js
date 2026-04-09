"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
console.log('DATABASE_URL:', process.env.DATABASE_URL);
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const restaurantRoutes_1 = __importDefault(require("./routes/restaurantRoutes"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const ownerRequestRoutes_1 = __importDefault(require("./routes/ownerRequestRoutes"));
const ownerRoutes_1 = __importDefault(require("./routes/ownerRoutes"));
const notificationRoutes_1 = __importDefault(require("./routes/notificationRoutes"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const morgan_1 = __importDefault(require("morgan"));
const errorHandler_1 = require("./middleware/errorHandler");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Security and Logging Middlewares
app.use((0, helmet_1.default)());
app.use((0, morgan_1.default)(':method :url :status :res[content-length] - :response-time ms'));
// CORS Hardening
const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5174', 'http://127.0.0.1:5174', 'http://localhost:3000'];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    }
}));
app.use(express_1.default.json({ limit: '10mb' }));
// Rate Limiting
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: { success: false, message: 'Too many requests, please try again later.' }
});
const defaultLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 300,
});
// Routes
app.use('/api/auth', authLimiter, authRoutes_1.default);
app.use("/api/restaurants", defaultLimiter, restaurantRoutes_1.default);
app.use("/api/admin", defaultLimiter, adminRoutes_1.default);
app.use("/api/owner-requests", authLimiter, ownerRequestRoutes_1.default);
app.use("/api/owner", defaultLimiter, ownerRoutes_1.default);
app.use("/api/notifications", notificationRoutes_1.default);
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});
// Sentry Error Handler (Commented out temporarily if causing issues)
// Sentry.setupExpressErrorHandler(app);
// Global Error Handler must be the last middleware
app.use(errorHandler_1.errorHandler);
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
//# sourceMappingURL=index.js.map