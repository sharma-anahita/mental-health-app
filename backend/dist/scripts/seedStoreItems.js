"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedStoreItems = seedStoreItems;
const StoreItem_1 = __importDefault(require("../models/StoreItem"));
const DEFAULT_ITEMS = [
    {
        name: 'Calm',
        type: 'theme',
        price: 0,
        itemKey: 'calm',
        purchasable: false,
    },
    {
        name: 'Focus',
        type: 'theme',
        price: 0,
        itemKey: 'focus',
        purchasable: false,
    },
    {
        name: 'Sunset',
        type: 'theme',
        price: 75,
        itemKey: 'sunset',
        purchasable: true,
    },
    {
        name: 'Midnight',
        type: 'theme',
        price: 100,
        itemKey: 'midnight',
        purchasable: true,
    },
    {
        name: 'Font Colors',
        type: 'fontColor',
        price: 20,
        itemKey: 'font-colors',
        purchasable: true,
        description: 'Unlock custom text color options',
    },
    {
        name: 'Font Styles',
        type: 'fontStyle',
        price: 50,
        itemKey: 'font-style',
        purchasable: true,
        description: 'Unlock custom font styles for the app',
    },
    {
        name: 'Time Travel Ticket',
        type: 'consumable',
        price: 30,
        itemKey: 'streak-restore',
        purchasable: true,
        description: 'Restore your streak if you miss a day',
    },
];
async function seedStoreItems() {
    let inserted = 0;
    let existing = 0;
    for (const item of DEFAULT_ITEMS) {
        const result = await StoreItem_1.default.updateOne({ key: item.itemKey }, {
            $set: {
                active: item.purchasable,
                cost: item.price,
            },
            $setOnInsert: {
                name: item.name,
                type: item.type,
                key: item.itemKey,
                description: item.description ??
                    (item.purchasable ? `${item.name} theme` : 'Default starter theme'),
            },
        }, { upsert: true });
        if (result.upsertedCount > 0) {
            inserted++;
            console.log(`[seed] inserted: ${item.itemKey}`);
        }
        else {
            existing++;
            console.log(`[seed] exists: ${item.itemKey}`);
        }
    }
    console.log(`[seed] completed → inserted=${inserted}, existing=${existing}`);
}
