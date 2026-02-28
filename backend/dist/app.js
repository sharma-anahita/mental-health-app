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
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: 'http://localhost:5173',
    credentials: true,
}));
app.use('/api/auth', authRoutes_1.default);
app.use('/api/moods', moodRoutes_1.default);
app.use('/api/gamification', gamificationRoutes_1.default);
app.use('/api/user', userRoutes_1.default);
app.use('/api/goals', goalRoutes_1.default);
app.use('/api/insights', insightsRoutes_1.default);
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});
app.use((err, req, res, next) => {
    console.error(err);
    const status = err.status || 500;
    res.status(status).json({ message: err.message || 'Internal Server Error' });
});
exports.default = app;
