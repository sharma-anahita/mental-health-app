"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteGoal = exports.updateGoal = exports.createFromRecommendation = exports.createGoal = exports.listGoals = void 0;
const Goal_1 = __importDefault(require("../models/Goal"));
const User_1 = __importDefault(require("../models/User"));
const Recommendation_1 = __importDefault(require("../models/Recommendation"));
const progressionService_1 = __importDefault(require("../services/progressionService"));
const listGoals = async (req, res) => {
    const userId = req.userId;
    const goals = await Goal_1.default.find({ userId }).sort({ createdAt: -1 }).lean();
    res.json({ goals });
};
exports.listGoals = listGoals;
const createGoal = async (req, res) => {
    const userId = req.userId;
    const { type, text } = req.body;
    if (!type || !text)
        return res.status(400).json({ message: 'Missing type or text' });
    const goal = await Goal_1.default.create({ userId, type, text });
    res.status(201).json({ goal });
};
exports.createGoal = createGoal;
const createFromRecommendation = async (req, res) => {
    const userId = req.userId;
    if (!userId)
        return res.status(401).json({ message: 'Unauthorized' });
    const { recommendationId, activityId, title } = req.body;
    if (!recommendationId || !activityId || !title) {
        return res.status(400).json({ message: 'Missing recommendationId, activityId, or title' });
    }
    if (title.length > 200) {
        return res.status(400).json({ message: 'Title must be 200 characters or less' });
    }
    // Validate recommendation exists and belongs to the requesting user
    const rec = await Recommendation_1.default.findOne({ _id: recommendationId, userId }).lean();
    if (!rec) {
        return res.status(404).json({ message: 'Recommendation snapshot not found' });
    }
    // Validate activityId is part of the recommendation's activities list
    const hasActivity = rec.activities.some((a) => String(a.activityId) === activityId);
    if (!hasActivity) {
        return res.status(400).json({ message: 'Activity is not part of this recommendation snapshot' });
    }
    // Create the goal under type 'recommended'
    const goal = await Goal_1.default.create({
        userId,
        type: 'recommended',
        text: title,
        sourceRecommendationId: recommendationId,
        sourceActivityId: activityId,
        completed: false
    });
    res.status(201).json({ goal, xpGained: 0 });
};
exports.createFromRecommendation = createFromRecommendation;
const updateGoal = async (req, res) => {
    const userId = req.userId;
    const { id } = req.params;
    const patch = req.body;
    const goal = await Goal_1.default.findOne({ _id: id, userId });
    if (!goal)
        return res.status(404).json({ message: 'Goal not found' });
    const wasCompleted = goal.completed;
    if (patch.text !== undefined)
        goal.text = patch.text;
    if (patch.completed !== undefined) {
        goal.completed = !!patch.completed;
        goal.completedAt = patch.completed ? new Date() : null;
    }
    await goal.save();
    // If newly completed, award XP
    let xpGained = 0;
    let updatedUser = null;
    if (!wasCompleted && goal.completed) {
        const user = await User_1.default.findById(userId);
        if (user) {
            // simple award: 5 XP for completing a goal
            const { user: u, xpGained: gained } = await progressionService_1.default.rewardGoalCompletion(user, 5, `goal:${goal._id}`);
            xpGained = gained;
            updatedUser = u;
        }
    }
    res.json({ goal, xpGained, user: updatedUser });
};
exports.updateGoal = updateGoal;
const deleteGoal = async (req, res) => {
    const userId = req.userId;
    const { id } = req.params;
    const goal = await Goal_1.default.findOne({ _id: id, userId });
    if (!goal)
        return res.status(404).json({ message: 'Goal not found' });
    await Goal_1.default.deleteOne({ _id: id });
    res.json({ message: 'Goal deleted' });
};
exports.deleteGoal = deleteGoal;
