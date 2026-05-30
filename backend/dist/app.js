"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const moodRoutes_1 = __importDefault(require("./routes/moodRoutes"));
const gamificationRoutes_1 = __importDefault(require("./routes/gamificationRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const goalRoutes_1 = __importDefault(require("./routes/goalRoutes"));
const insightsRoutes_1 = __importDefault(require("./routes/insightsRoutes"));
const preferencesRoutes_1 = __importDefault(require("./routes/preferencesRoutes"));
const reflectionRoutes_1 = __importDefault(require("./routes/reflectionRoutes"));
const storeRoutes_1 = __importDefault(require("./routes/storeRoutes"));
const streakRoutes_1 = __importDefault(require("./routes/streakRoutes"));
const chatRoutes_1 = __importDefault(require("./routes/chatRoutes"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
// ...
const app = (0, express_1.default)();
app.use(express_1.default.json());
// Configure CORS to allow the deployed frontend and local dev origins.
// Read `FRONTEND_URL` from environment (set on Render) and include common
// localhost dev origins. Use a whitelist function so the response header
// mirrors the requesting origin when allowed.
const envFrontend = (process.env.FRONTEND_URL || '').trim();
const allowedOrigins = [envFrontend, 'http://localhost:5173', 'http://localhost:3000'].filter(Boolean);
console.log('[CORS] allowed origins:', allowedOrigins);
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow non-browser requests (curl, server-side) that have no origin
        if (!origin)
            return callback(null, true);
        // Exact match whitelist
        if (allowedOrigins.includes(origin))
            return callback(null, true);
        // Allow any Vercel preview/domain under `*.vercel.app` to avoid
        // breaking when Vercel assigns a new auto-generated subdomain.
        try {
            const lc = origin.toLowerCase();
            if (lc.endsWith('.vercel.app'))
                return callback(null, true);
        }
        catch (e) {
            // ignore
        }
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
}));
app.use('/api/user/preferences', preferencesRoutes_1.default);
app.use('/api/preferences', preferencesRoutes_1.default);
app.use('/api/auth', authRoutes_1.default);
app.use('/api/moods', moodRoutes_1.default);
app.use('/api/reflections', reflectionRoutes_1.default);
app.use('/api/gamification', gamificationRoutes_1.default);
app.use('/api/user', userRoutes_1.default);
app.use('/api/goals', goalRoutes_1.default);
app.use('/api/insights', insightsRoutes_1.default);
app.use('/api/store', storeRoutes_1.default);
app.use('/api/streak', streakRoutes_1.default);
app.use('/api/chat', chatRoutes_1.default);
app.use('/chat', chatRoutes_1.default);
app.use('/api/admin', adminRoutes_1.default);
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});
app.use((err, req, res, next) => {
    console.error(err);
    const status = err.status || 500;
    res.status(status).json({ message: err.message || 'Internal Server Error' });
});
exports.default = app;
