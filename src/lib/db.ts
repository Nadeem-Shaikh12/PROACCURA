import fs from 'fs/promises';
import path from 'path';
import { User, Property, VerificationRequest, TenantHistory, Notification, Bill, Message, Review, TenantStay } from '@/lib/types';
import { StoredDocument } from './store';
import * as Models from '@/models';
import dbConnect from './mongoose';

// Re-export types
export type { User, Property, VerificationRequest, TenantHistory, Notification, Bill, Message, Review, TenantStay };

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');

// --- JSON IMPLEMENTATION ---
interface JSONSchema {
    users: User[];
    properties: Property[];
    verificationRequests: VerificationRequest[];
    history: TenantHistory[];
    notifications: Notification[];
    bills: Bill[];
    documents: StoredDocument[];
    messages: Message[];
    reviews: Review[];
    tenantStays: TenantStay[];
}

// --- HYBRID ADAPTER ---
class DBAdapter {
    private useMongo: boolean;
    private inMemoryCache: JSONSchema | null = null;

    constructor() {
        const MONGODB_URI = process.env.MONGODB_URI;
        this.useMongo = process.env.NODE_ENV === 'production' && !!MONGODB_URI;
    }

    // HELPER: Connect to Mongo if needed
    private async init() {
        if (this.useMongo) {
            try {
                await dbConnect();
            } catch (error) {
                console.error("MongoDB Connection Failed (Falling back to JSON):", error);
                this.useMongo = false;
            }
        }
    }

    // HELPER: Read JSON
    private async readJSON(): Promise<JSONSchema> {
        if (this.inMemoryCache) return this.inMemoryCache;

        try {
            const data = await fs.readFile(DB_PATH, 'utf-8');
            this.inMemoryCache = JSON.parse(data);
            return this.inMemoryCache!;
        } catch (error) {
            // If file missing or read error, return empty structure (or default)
            // But initialize cache so we can write to it later
            if (!this.inMemoryCache) {
                this.inMemoryCache = {
                    users: [], properties: [], verificationRequests: [], history: [],
                    notifications: [], bills: [], documents: [], messages: [], reviews: [], tenantStays: []
                };
            }
            return this.inMemoryCache;
        }
    }

    // HELPER: Write JSON
    private async writeJSON(data: JSONSchema): Promise<void> {
        this.inMemoryCache = data; // Always update memory
        try {
            await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
        } catch (error: any) {
            if (error.code === 'EROFS') {
                console.warn("Read-only file system detected. Data saved to memory only.");
            } else {
                console.error("Failed to write to DB file:", error);
            }
        }
    }

    // =========================================================================
    // USER METHODS
    // =========================================================================

    async getUsers() {
        await this.init();
        if (this.useMongo) {
            const res = await Models.User.find({}).lean();
            return res as unknown as User[];
        } else {
            const db = await this.readJSON();
            return db.users;
        }
    }

    async addUser(user: User) {
        await this.init();
        if (this.useMongo) {
            const res = await Models.User.create(user);
            return res.toObject() as unknown as User;
        } else {
            const db = await this.readJSON();
            db.users.push(user);
            await this.writeJSON(db);
            return user;
        }
    }

    async findUserByEmail(email: string) {
        await this.init();
        if (this.useMongo) {
            const res = await Models.User.findOne({ email }).lean();
            return res as unknown as User | null;
        } else {
            const db = await this.readJSON();
            return db.users.find(u => u.email === email) || null;
        }
    }

    async findUserById(id: string) {
        await this.init();
        if (this.useMongo) {
            const res = await Models.User.findOne({ id }).lean();
            return res as unknown as User | null;
        } else {
            const db = await this.readJSON();
            return db.users.find(u => u.id === id) || null;
        }
    }

    async getLandlords() {
        await this.init();
        if (this.useMongo) {
            const res = await Models.User.find({ role: 'landlord' }).select('id name').lean();
            return res as unknown as { id: string; name: string }[];
        } else {
            const db = await this.readJSON();
            return db.users
                .filter(u => u.role === 'landlord')
                .map(u => ({ id: u.id, name: u.name }));
        }
    }

    async updateUser(id: string, updates: Partial<User>) {
        await this.init();
        if (this.useMongo) {
            const res = await Models.User.findOneAndUpdate({ id }, updates, { new: true }).lean();
            return res as unknown as User | null;
        } else {
            const db = await this.readJSON();
            const index = db.users.findIndex(u => u.id === id);
            if (index === -1) return null;
            db.users[index] = { ...db.users[index], ...updates };
            await this.writeJSON(db);
            return db.users[index];
        }
    }

    // =========================================================================
    // VERIFICATION REQUEST METHODS
    // =========================================================================
    async getRequests() {
        await this.init();
        if (this.useMongo) {
            const res = await Models.VerificationRequest.find({}).lean();
            return res as unknown as VerificationRequest[];
        } else {
            const db = await this.readJSON();
            return db.verificationRequests;
        }
    }

    async findRequestByTenantId(tenantId: string) {
        await this.init();
        if (this.useMongo) {
            const res = await Models.VerificationRequest.findOne({ tenantId }).sort({ submittedAt: -1 }).lean();
            return res as unknown as VerificationRequest | undefined;
        } else {
            const db = await this.readJSON();
            return db.verificationRequests
                .filter(r => r.tenantId === tenantId)
                .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())[0];
        }
    }

    async findRequestById(id: string) {
        await this.init();
        if (this.useMongo) {
            const res = await Models.VerificationRequest.findOne({ id }).lean();
            return res as unknown as VerificationRequest | undefined;
        } else {
            const db = await this.readJSON();
            return db.verificationRequests.find(r => r.id === id);
        }
    }

    async addRequest(req: VerificationRequest) {
        await this.init();
        if (this.useMongo) {
            const res = await Models.VerificationRequest.create(req);
            return res.toObject() as unknown as VerificationRequest;
        } else {
            const db = await this.readJSON();
            db.verificationRequests.push(req);
            await this.writeJSON(db);
            return req;
        }
    }

    async updateRequest(id: string, updates: Partial<VerificationRequest>) {
        await this.init();
        if (this.useMongo) {
            const res = await Models.VerificationRequest.findOneAndUpdate({ id }, updates, { new: true }).lean();
            return res as unknown as VerificationRequest | null;
        } else {
            const db = await this.readJSON();
            const index = db.verificationRequests.findIndex(r => r.id === id);
            if (index === -1) return null;
            db.verificationRequests[index] = { ...db.verificationRequests[index], ...updates };
            await this.writeJSON(db);
            return db.verificationRequests[index];
        }
    }

    async updateRequestStatus(id: string, status: 'approved' | 'rejected' | 'moved_out', remarks?: string, extraData?: { joiningDate?: string, rentNotes?: string, utilityDetails?: string }) {
        await this.init();
        if (this.useMongo) {
            const updates: any = { status, updatedAt: new Date().toISOString() };
            if (remarks !== undefined) updates.remarks = remarks;
            if (extraData) {
                if (extraData.joiningDate !== undefined) updates.joiningDate = extraData.joiningDate;
                if (extraData.rentNotes !== undefined) updates.rentNotes = extraData.rentNotes;
                if (extraData.utilityDetails !== undefined) updates.utilityDetails = extraData.utilityDetails;
            }
            // For MongoDB we need to handle verifiedAt carefully or just overwrite it
            // Simplified logic matching JSON:
            let request = await Models.VerificationRequest.findOne({ id });
            if (!request) return null;

            request.status = status;
            if (remarks !== undefined) request.remarks = remarks;
            if (extraData) {
                if (extraData.joiningDate) request.joiningDate = extraData.joiningDate;
                if (extraData.rentNotes) request.rentNotes = extraData.rentNotes;
                if (extraData.utilityDetails) request.utilityDetails = extraData.utilityDetails;
            }
            request.updatedAt = new Date().toISOString();
            if (status === 'approved' && !request.verifiedAt) {
                request.verifiedAt = new Date().toISOString();
            }
            await request.save();
            return request.toObject() as unknown as VerificationRequest;

        } else {
            const db = await this.readJSON();
            const index = db.verificationRequests.findIndex(r => r.id === id);
            if (index === -1) return null;

            const request = db.verificationRequests[index];
            request.status = status;
            if (remarks !== undefined) request.remarks = remarks;
            if (extraData) {
                if (extraData.joiningDate) request.joiningDate = extraData.joiningDate;
                if (extraData.rentNotes) request.rentNotes = extraData.rentNotes;
                if (extraData.utilityDetails) request.utilityDetails = extraData.utilityDetails;
            }
            request.updatedAt = new Date().toISOString();
            if (status === 'approved' && !request.verifiedAt) {
                request.verifiedAt = new Date().toISOString();
            }

            db.verificationRequests[index] = request;
            await this.writeJSON(db);
            return request;
        }
    }

    // =========================================================================
    // HISTORY METHODS
    // =========================================================================
    async addHistory(record: TenantHistory) {
        await this.init();
        if (this.useMongo) {
            const res = await Models.History.create(record);
            return res.toObject() as unknown as TenantHistory;
        } else {
            const db = await this.readJSON();
            db.history.push(record);
            await this.writeJSON(db);
            return record;
        }
    }

    async getTenantHistory(tenantId: string) {
        await this.init();
        if (this.useMongo) {
            const res = await Models.History.find({ tenantId }).sort({ date: -1 }).lean();
            return res as unknown as TenantHistory[];
        } else {
            const db = await this.readJSON();
            return db.history.filter(h => h.tenantId === tenantId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        }
    }

    // =========================================================================
    // NOTIFICATION METHODS
    // =========================================================================
    async getNotifications(userId: string) {
        await this.init();
        if (this.useMongo) {
            const res = await Models.Notification.find({ userId }).sort({ createdAt: -1 }).lean();
            return res as unknown as Notification[];
        } else {
            const db = await this.readJSON();
            return db.notifications.filter(n => n.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
    }

    async addNotification(notification: Notification) {
        await this.init();
        if (this.useMongo) {
            const res = await Models.Notification.create(notification);
            return res.toObject() as unknown as Notification;
        } else {
            const db = await this.readJSON();
            db.notifications.push(notification);
            await this.writeJSON(db);
            return notification;
        }
    }

    async updateNotification(id: string, updates: Partial<Notification>) {
        await this.init();
        if (this.useMongo) {
            const res = await Models.Notification.findOneAndUpdate({ id }, updates, { new: true }).lean();
            return res as unknown as Notification | null;
        } else {
            const db = await this.readJSON();
            const index = db.notifications.findIndex(n => n.id === id);
            if (index === -1) return null;
            db.notifications[index] = { ...db.notifications[index], ...updates };
            await this.writeJSON(db);
            return db.notifications[index];
        }
    }

    async markAllNotificationsAsRead(userId: string) {
        await this.init();
        if (this.useMongo) {
            await Models.Notification.updateMany({ userId }, { isRead: true });
        } else {
            const db = await this.readJSON();
            let changed = false;
            db.notifications = db.notifications.map(n => {
                if (n.userId === userId && !n.isRead) {
                    changed = true;
                    return { ...n, isRead: true };
                }
                return n;
            });
            if (changed) await this.writeJSON(db);
        }
    }

    // =========================================================================
    // PROPERTY METHODS
    // =========================================================================
    async findPropertyById(id: string) {
        await this.init();
        if (this.useMongo) {
            const res = await Models.Property.findOne({ id }).lean();
            return res as unknown as Property | undefined;
        } else {
            const db = await this.readJSON();
            return db.properties.find(p => p.id === id);
        }
    }

    async getProperties(landlordId: string) {
        await this.init();
        if (this.useMongo) {
            const res = await Models.Property.find({ landlordId }).lean();
            return res as unknown as Property[];
        } else {
            const db = await this.readJSON();
            return db.properties.filter(p => p.landlordId === landlordId);
        }
    }

    async getAllProperties() {
        await this.init();
        if (this.useMongo) {
            const res = await Models.Property.find({}).lean();
            return res as unknown as Property[];
        } else {
            const db = await this.readJSON();
            return db.properties;
        }
    }

    async addProperty(property: Property) {
        await this.init();
        if (this.useMongo) {
            const res = await Models.Property.create(property);
            return res.toObject() as unknown as Property;
        } else {
            const db = await this.readJSON();
            db.properties.push(property);
            await this.writeJSON(db);
            return property;
        }
    }

    async deleteProperty(id: string) {
        await this.init();
        if (this.useMongo) {
            await Models.Property.deleteOne({ id });
        } else {
            const db = await this.readJSON();
            db.properties = db.properties.filter(p => p.id !== id);
            await this.writeJSON(db);
        }
    }

    async updateProperty(id: string, updates: Partial<Property>) {
        await this.init();
        if (this.useMongo) {
            const res = await Models.Property.findOneAndUpdate({ id }, updates, { new: true }).lean();
            return res as unknown as Property | null;
        } else {
            const db = await this.readJSON();
            const index = db.properties.findIndex(p => p.id === id);
            if (index === -1) return null;
            db.properties[index] = { ...db.properties[index], ...updates };
            await this.writeJSON(db);
            return db.properties[index];
        }
    }

    // =========================================================================
    // TENANT STAY METHODS
    // =========================================================================
    async addTenantStay(stay: TenantStay) {
        await this.init();
        if (this.useMongo) {
            const res = await Models.TenantStay.create(stay);
            return res.toObject() as unknown as TenantStay;
        } else {
            const db = await this.readJSON();
            db.tenantStays.push(stay);
            await this.writeJSON(db);
            return stay;
        }
    }

    async endTenantStay(tenantId: string) {
        await this.init();
        if (this.useMongo) {
            const stay = await Models.TenantStay.findOne({ tenantId, status: 'ACTIVE' });
            if (stay) {
                stay.status = 'MOVED_OUT';
                stay.moveOutDate = new Date().toISOString();
                await stay.save();
                return stay.toObject() as unknown as TenantStay;
            }
            return null;
        } else {
            const db = await this.readJSON();
            const index = db.tenantStays.findIndex(s => s.tenantId === tenantId && s.status === 'ACTIVE');
            if (index !== -1) {
                db.tenantStays[index].status = 'MOVED_OUT';
                db.tenantStays[index].moveOutDate = new Date().toISOString();
                await this.writeJSON(db);
                return db.tenantStays[index];
            }
            return null;
        }
    }

    async getTenantStay(tenantId: string) {
        await this.init();
        if (this.useMongo) {
            const res = await Models.TenantStay.findOne({ tenantId, status: 'ACTIVE' }).lean();
            return res as unknown as TenantStay | undefined;
        } else {
            const db = await this.readJSON();
            return db.tenantStays.find(s => s.tenantId === tenantId && s.status === 'ACTIVE');
        }
    }

    async getLandlordTenants(landlordId: string) {
        await this.init();
        if (this.useMongo) {
            const stays = await Models.TenantStay.find({ landlordId, status: 'ACTIVE' }).lean();
            const results = await Promise.all(stays.map(async (stay) => {
                const tenant = await Models.User.findOne({ id: stay.tenantId }).lean();
                const property = await Models.Property.findOne({ id: stay.propertyId }).lean();
                return {
                    ...stay,
                    tenantName: tenant?.name || 'Unknown',
                    propertyName: property?.name || 'Unknown',
                    propertyAddress: property?.address
                };
            }));
            return results;
        } else {
            const db = await this.readJSON();
            const stays = db.tenantStays.filter(s => s.landlordId === landlordId && s.status === 'ACTIVE');
            return stays.map(stay => {
                const tenant = db.users.find(u => u.id === stay.tenantId);
                const property = db.properties.find(p => p.id === stay.propertyId);
                return {
                    ...stay,
                    tenantName: tenant?.name || 'Unknown',
                    propertyName: property?.name || 'Unknown',
                    propertyAddress: property?.address
                };
            });
        }
    }

    // =========================================================================
    // BILL METHODS
    // =========================================================================
    async addBill(bill: Bill) {
        await this.init();
        if (this.useMongo) {
            const res = await Models.Bill.create(bill);
            return res.toObject() as unknown as Bill;
        } else {
            const db = await this.readJSON();
            db.bills.push(bill);
            await this.writeJSON(db);
            return bill;
        }
    }

    async getBillsByLandlord(landlordId: string) {
        await this.init();
        if (this.useMongo) {
            const res = await Models.Bill.find({ landlordId }).lean();
            return res as unknown as Bill[];
        } else {
            const db = await this.readJSON();
            return db.bills.filter(b => b.landlordId === landlordId);
        }
    }

    async getBillsByTenant(tenantId: string) {
        await this.init();
        if (this.useMongo) {
            const res = await Models.Bill.find({ tenantId }).lean();
            return res as unknown as Bill[];
        } else {
            const db = await this.readJSON();
            return db.bills.filter(b => b.tenantId === tenantId);
        }
    }

    async payBill(billId: string) {
        await this.init();
        if (this.useMongo) {
            const bill = await Models.Bill.findOne({ id: billId });
            if (bill) {
                bill.status = 'PAID';
                bill.paidAt = new Date().toISOString();
                await bill.save();

                await this.addHistory({
                    id: Math.random().toString(36).substr(2, 9),
                    tenantId: bill.tenantId,
                    type: 'PAYMENT',
                    date: new Date().toISOString(),
                    description: `Paid ${bill.type} bill`,
                    amount: bill.amount,
                    createdBy: bill.tenantId
                });
                return bill.toObject() as unknown as Bill;
            }
            return null;
        } else {
            const db = await this.readJSON();
            const index = db.bills.findIndex(b => b.id === billId);
            if (index !== -1) {
                db.bills[index].status = 'PAID';
                db.bills[index].paidAt = new Date().toISOString();

                db.history.push({
                    id: Math.random().toString(36).substr(2, 9),
                    tenantId: db.bills[index].tenantId,
                    type: 'PAYMENT',
                    date: new Date().toISOString(),
                    description: `Paid ${db.bills[index].type} bill`,
                    amount: db.bills[index].amount,
                    createdBy: db.bills[index].tenantId
                });

                await this.writeJSON(db);
                return db.bills[index];
            }
            return null;
        }
    }

    async deleteBill(billId: string) {
        await this.init();
        if (this.useMongo) {
            const res = await Models.Bill.deleteOne({ id: billId });
            return res.deletedCount > 0;
        } else {
            const db = await this.readJSON();
            const initialLength = db.bills.length;
            db.bills = db.bills.filter(b => b.id !== billId);
            await this.writeJSON(db);
            return db.bills.length < initialLength;
        }
    }

    // =========================================================================
    // DOCUMENT METHODS
    // =========================================================================
    async addDocument(doc: StoredDocument) {
        await this.init();
        if (this.useMongo) {
            const res = await Models.Document.create(doc);
            return res.toObject() as unknown as StoredDocument;
        } else {
            const db = await this.readJSON();
            db.documents.push(doc);
            await this.writeJSON(db);
            return doc;
        }
    }

    async getDocumentsByLandlord(landlordId: string) {
        await this.init();
        if (this.useMongo) {
            const res = await Models.Document.find({ landlordId }).lean();
            return res as unknown as StoredDocument[];
        } else {
            const db = await this.readJSON();
            return db.documents.filter(d => d.landlordId === landlordId);
        }
    }

    async getDocumentsByTenant(tenantId: string) {
        await this.init();
        if (this.useMongo) {
            const res = await Models.Document.find({ tenantId }).lean();
            return res as unknown as StoredDocument[];
        } else {
            const db = await this.readJSON();
            return db.documents.filter(d => d.tenantId === tenantId);
        }
    }

    // =========================================================================
    // MESSAGE METHODS
    // =========================================================================
    async addMessage(message: Message) {
        await this.init();
        if (this.useMongo) {
            const res = await Models.Message.create(message);
            return res.toObject() as unknown as Message;
        } else {
            const db = await this.readJSON();
            db.messages.push(message);
            await this.writeJSON(db);
            return message;
        }
    }

    async getMessages(userId1: string, userId2: string) {
        await this.init();
        if (this.useMongo) {
            const res = await Models.Message.find({
                $or: [
                    { senderId: userId1, receiverId: userId2 },
                    { senderId: userId2, receiverId: userId1 }
                ]
            }).sort({ timestamp: 1 }).lean();
            return res as unknown as Message[];
        } else {
            const db = await this.readJSON();
            return db.messages.filter(m =>
                (m.senderId === userId1 && m.receiverId === userId2) ||
                (m.senderId === userId2 && m.receiverId === userId1)
            ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        }
    }

    async markMessagesAsRead(senderId: string, receiverId: string) {
        await this.init();
        if (this.useMongo) {
            await Models.Message.updateMany({ senderId, receiverId, isRead: false }, { isRead: true });
        } else {
            const db = await this.readJSON();
            let changed = false;
            db.messages = db.messages.map(m => {
                if (m.senderId === senderId && m.receiverId === receiverId && !m.isRead) {
                    changed = true;
                    return { ...m, isRead: true };
                }
                return m;
            });
            if (changed) await this.writeJSON(db);
        }
    }

    async getUnreadCount(userId: string) {
        await this.init();
        if (this.useMongo) {
            return await Models.Message.countDocuments({ receiverId: userId, isRead: false });
        } else {
            const db = await this.readJSON();
            return db.messages.filter(m => m.receiverId === userId && !m.isRead).length;
        }
    }

    async getUnreadCountsBySender(userId: string) {
        await this.init();
        if (this.useMongo) {
            const results = await Models.Message.aggregate([
                { $match: { receiverId: userId, isRead: false } },
                { $group: { _id: '$senderId', count: { $sum: 1 } } }
            ]);
            const counts: Record<string, number> = {};
            results.forEach((r: any) => {
                counts[r._id] = r.count;
            });
            return counts;
        } else {
            const db = await this.readJSON();
            const counts: Record<string, number> = {};
            db.messages.forEach(m => {
                if (m.receiverId === userId && !m.isRead) {
                    counts[m.senderId] = (counts[m.senderId] || 0) + 1;
                }
            });
            return counts;
        }
    }

    // =========================================================================
    // REVIEW METHODS
    // =========================================================================
    async addReview(review: Review) {
        await this.init();
        if (this.useMongo) {
            const res = await Models.Review.create(review);
            return res.toObject() as unknown as Review;
        } else {
            const db = await this.readJSON();
            db.reviews.push(review);
            await this.writeJSON(db);
            return review;
        }
    }

    async getReviews(userId: string) {
        await this.init();
        if (this.useMongo) {
            const res = await Models.Review.find({ revieweeId: userId }).sort({ createdAt: -1 }).lean();
            return res as unknown as Review[];
        } else {
            const db = await this.readJSON();
            return db.reviews.filter(r => r.revieweeId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
    }
}

export const db = new DBAdapter();
