"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = __importDefault(require("../config/redis"));
(async () => {
    try {
        await redis_1.default.set('test', 'hello');
        const value = await redis_1.default.get('test');
        console.log('redis.get("test") =>', value);
    }
    catch (err) {
        console.error('Redis test failed:', err);
        process.exit(1);
    }
    process.exit(0);
})();
