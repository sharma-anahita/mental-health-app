"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.purchaseStoreItem = exports.getStoreItems = void 0;
const User_1 = __importDefault(require("../models/User"));
const StoreItem_1 = __importDefault(require("../models/StoreItem"));
function getAuthUserId(req) {
    if (req.userId)
        return req.userId;
    if (req.user?.id)
        return req.user.id;
    if (req.user?._id)
        return req.user._id;
    if (req.user?.userId)
        return req.user.userId;
    return undefined;
}
function normalizeInventoryEntries(inventory) {
    const ownedKeys = new Set();
    const ownedItemIds = [];
    if (!Array.isArray(inventory)) {
        return { ownedKeys, ownedItemIds };
    }
    for (const entry of inventory) {
        if (typeof entry === 'string') {
            ownedKeys.add(entry);
            continue;
        }
        if (!entry || typeof entry !== 'object')
            continue;
        const maybeEntry = entry;
        if (typeof maybeEntry.itemKey === 'string')
            ownedKeys.add(maybeEntry.itemKey);
        if (typeof maybeEntry.key === 'string')
            ownedKeys.add(maybeEntry.key);
        if (maybeEntry.itemId)
            ownedItemIds.push(String(maybeEntry.itemId));
    }
    return { ownedKeys, ownedItemIds };
}
function getStoreItemKey(item) {
    return String(item.key ?? item.itemKey ?? '');
}
function getStoreItemPrice(item) {
    const raw = item.cost ?? item.price;
    return typeof raw === 'number' ? raw : Number(raw || 0);
}
function usesStringInventorySchema() {
    const inventoryPath = User_1.default.schema.path('inventory');
    const embeddedType = inventoryPath?.$embeddedSchemaType?.instance;
    const casterType = inventoryPath?.caster?.instance;
    return embeddedType === 'String' || casterType === 'String';
}
const getStoreItems = async (req, res, next) => {
    try {
        const userId = getAuthUserId(req);
        if (!userId)
            return res.status(401).json({ message: 'Unauthorized' });
        const [items, user] = await Promise.all([
            StoreItem_1.default.find({ active: { $ne: false } }).sort({ cost: 1, name: 1 }).lean(),
            User_1.default.findById(userId).select('coins inventory').lean(),
        ]);
        if (!user)
            return res.status(404).json({ message: 'User not found' });
        const { ownedKeys, ownedItemIds } = normalizeInventoryEntries(user.inventory);
        if (ownedItemIds.length > 0) {
            const ownedItems = await StoreItem_1.default.find({ _id: { $in: ownedItemIds } }).select('key').lean();
            for (const owned of ownedItems) {
                const key = getStoreItemKey(owned);
                if (key)
                    ownedKeys.add(key);
            }
        }
        const responseItems = items.map((item) => {
            const itemKey = getStoreItemKey(item);
            const price = getStoreItemPrice(item);
            return {
                id: String(item._id),
                name: item.name,
                type: item.type,
                price,
                itemKey,
                description: item.description ?? '',
                owned: ownedKeys.has(itemKey),
            };
        });
        return res.json({
            items: responseItems,
            ownedItemKeys: Array.from(ownedKeys),
            user: {
                coins: user.coins ?? 0,
            },
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getStoreItems = getStoreItems;
const purchaseStoreItem = async (req, res, next) => {
    try {
        const userId = getAuthUserId(req);
        if (!userId)
            return res.status(401).json({ message: 'Unauthorized' });
        const { itemKey } = req.body;
        const normalizedItemKey = typeof itemKey === 'string' ? itemKey.trim() : '';
        if (!normalizedItemKey) {
            return res.status(400).json({ message: 'itemKey is required' });
        }
        const item = await StoreItem_1.default.findOne({
            active: { $ne: false },
            $or: [{ key: normalizedItemKey }, { itemKey: normalizedItemKey }],
        });
        if (!item) {
            return res.status(404).json({ message: 'Store item not found' });
        }
        const price = getStoreItemPrice(item);
        if (!Number.isFinite(price) || price < 0) {
            return res.status(400).json({ message: 'Invalid store item price' });
        }
        const inventoryIsString = usesStringInventorySchema();
        const isConsumable = item.type === 'consumable';
        const duplicateOwnershipOr = inventoryIsString
            ? [{ inventory: normalizedItemKey }]
            : [{ 'inventory.itemId': item._id }];
        const duplicateOwnershipQuery = {
            $or: duplicateOwnershipOr,
        };
        let purchaseResult = { modifiedCount: 0 };
        if (isConsumable) {
            if (inventoryIsString) {
                // String inventory fallback: each additional entry is treated as +1 quantity.
                purchaseResult = await User_1.default.updateOne({
                    _id: userId,
                    coins: { $gte: price },
                }, {
                    $inc: { coins: -price },
                    $push: { inventory: normalizedItemKey },
                });
            }
            else {
                // First try to increment quantity if the consumable already exists in inventory.
                purchaseResult = await User_1.default.updateOne({
                    _id: userId,
                    coins: { $gte: price },
                    'inventory.itemId': item._id,
                }, {
                    $inc: {
                        coins: -price,
                        'inventory.$.quantity': 1,
                    },
                });
                if (purchaseResult.modifiedCount === 0) {
                    // Otherwise add it once with quantity 1.
                    purchaseResult = await User_1.default.updateOne({
                        _id: userId,
                        coins: { $gte: price },
                        'inventory.itemId': { $ne: item._id },
                    }, {
                        $inc: { coins: -price },
                        $push: {
                            inventory: {
                                itemId: item._id,
                                quantity: 1,
                                acquiredAt: new Date(),
                            },
                        },
                    });
                }
            }
        }
        else {
            // Non-consumables remain one-time purchases.
            const alreadyOwned = await User_1.default.exists({ _id: userId, ...duplicateOwnershipQuery });
            if (alreadyOwned) {
                return res.status(409).json({ message: 'Item already owned' });
            }
            const inventoryPushValue = inventoryIsString
                ? normalizedItemKey
                : { itemId: item._id, quantity: 1, acquiredAt: new Date() };
            purchaseResult = await User_1.default.updateOne({
                _id: userId,
                coins: { $gte: price },
                $nor: duplicateOwnershipOr,
            }, {
                $inc: { coins: -price },
                $push: { inventory: inventoryPushValue },
            });
        }
        if (purchaseResult.modifiedCount === 0) {
            const currentUser = await User_1.default.findById(userId).select('coins inventory');
            if (!currentUser)
                return res.status(404).json({ message: 'User not found' });
            const { ownedKeys, ownedItemIds } = normalizeInventoryEntries(currentUser.inventory);
            const ownsById = ownedItemIds.includes(String(item._id));
            const ownsByKey = ownedKeys.has(normalizedItemKey);
            if (!isConsumable && (ownsById || ownsByKey)) {
                return res.status(409).json({ message: 'Item already owned' });
            }
            if ((currentUser.coins ?? 0) < price) {
                return res.status(400).json({
                    message: 'Not enough coins',
                    required: price,
                    available: currentUser.coins ?? 0,
                });
            }
            return res.status(409).json({ message: 'Purchase could not be completed' });
        }
        const updatedUser = await User_1.default.findById(userId).select('name email coins inventory preferences xp streak level');
        if (!updatedUser)
            return res.status(404).json({ message: 'User not found' });
        return res.status(200).json({
            message: 'Purchase successful',
            purchasedItem: {
                itemKey: normalizedItemKey,
                price,
            },
            user: {
                id: String(updatedUser._id),
                name: updatedUser.name,
                email: updatedUser.email,
                coins: updatedUser.coins,
                inventory: updatedUser.inventory,
                preferences: updatedUser.preferences,
                xp: updatedUser.xp,
                level: updatedUser.level,
                streak: updatedUser.streak,
            },
        });
    }
    catch (err) {
        next(err);
    }
};
exports.purchaseStoreItem = purchaseStoreItem;
exports.default = {
    getStoreItems: exports.getStoreItems,
    purchaseStoreItem: exports.purchaseStoreItem,
};
