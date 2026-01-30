import fs from 'fs/promises';
import path from 'path';
import { User, Property, VerificationRequest, TenantHistory, Notification, Bill, Message, Review, TenantStay, MaintenanceRequest, Announcement, SupportArticle, SupportTicket } from '@/lib/types';
import { StoredDocument } from './store';
import * as Models from '@/models';
import SupportArticleModel from '@/models/SupportArticle';
import SupportTicketModel from '@/models/SupportTicket';
import dbConnect from './mongoose';

// Re-export types
export type { User, Property, VerificationRequest, TenantHistory, Notification, Bill, Message, Review, TenantStay, SupportArticle, SupportTicket };

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
    maintenanceRequests: MaintenanceRequest[];
    announcements: Announcement[];
    supportArticles: SupportArticle[];
    supportTickets: SupportTicket[];
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
                console.error("MongoDB Connection Failed:", error);
                // CRITICAL: In production, we cannot fall back to JSON as it is ephemeral on Vercel.
                // We must throw an error so the user knows something is wrong (e.g., IP whitelist issue).
                if (process.env.NODE_ENV === 'production') {
                    throw new Error("Database connection failed. Please check MONGODB_URI and IP Whitelist in MongoDB Atlas.");
                }
                this.useMongo = false;
            }
        }
    }

    // HELPER: Read JSON
    private async readJSON(): Promise<JSONSchema> {
        try {
            const data = await fs.readFile(DB_PATH, 'utf-8');
            this.inMemoryCache = JSON.parse(data);

            // Ensure new fields exist
            if (!this.inMemoryCache?.supportArticles) this.inMemoryCache!.supportArticles = [];
            if (!this.inMemoryCache?.supportTickets) this.inMemoryCache!.supportTickets = [];

        } catch (error) {
            if (!this.inMemoryCache) {
                this.inMemoryCache = {
                    users: [], properties: [], verificationRequests: [], history: [],
                    notifications: [], bills: [], documents: [], messages: [], reviews: [],
                    tenantStays: [], maintenanceRequests: [], announcements: [],
                    supportArticles: [], supportTickets: []
                };
            }
        }

        // Seed Support Articles if empty
        if (this.inMemoryCache!.supportArticles.length === 0) {
            this.inMemoryCache!.supportArticles = [
                {
                    id: 'kb-1',
                    title: 'How to change notification preferences',
                    category: 'ACCOUNT',
                    content: 'Go to Settings > Notifications to toggle Email and Push alerts for maintenance, payments, and documents.',
                    tags: ['notifications', 'settings', 'email'],
                    helpfulCount: 24,
                    updatedAt: new Date().toISOString()
                },
                {
                    id: 'kb-2',
                    title: 'How to configure tenant portal access',
                    category: 'TENANTS',
                    content: 'In Settings > Properties, you can toggle permissions for what tenants can see, such as payment history and document uploads.',
                    tags: ['tenant', 'portal', 'permissions'],
                    helpfulCount: 15,
                    updatedAt: new Date().toISOString()
                },
                {
                    id: 'kb-3',
                    title: 'How rent reminders work',
                    category: 'PAYMENTS',
                    content: 'Automated reminders are sent 3 days before the due date, on the due date, and every 2 days if the rent remains unpaid.',
                    tags: ['rent', 'reminders', 'payments'],
                    helpfulCount: 42,
                    updatedAt: new Date().toISOString()
                }
            ];
            await this.writeJSON(this.inMemoryCache!);
        }

        return this.inMemoryCache!;
    }

    // HELPER: Write JSON
    private async writeJSON(data: JSONSchema): Promise<void> {
        this.inMemoryCache = data;
        try {
            await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
            await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
        } catch (error) {
            const err = error as { code?: string };
            if (err.code === 'EROFS') {
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
            const searchEmail = email?.toLowerCase().trim();
            return db.users.find(u => (u.email || '').toLowerCase().trim() === searchEmail) || null;
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
            const request = await Models.VerificationRequest.findOne({ id });
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
            const res = await Models.Bill.findOneAndUpdate({ id: billId }, { status: 'PAID', paidAt: new Date().toISOString() }, { new: true }).lean();
            return res as unknown as Bill | null;
        } else {
            const db = await this.readJSON();
            const index = db.bills.findIndex(b => b.id === billId);
            if (index !== -1) {
                db.bills[index].status = 'PAID';
                db.bills[index].paidAt = new Date().toISOString();
                await this.writeJSON(db);
                return db.bills[index];
            }
            return null;
        }
    }

    async deleteBill(id: string) {
        await this.init();
        if (this.useMongo) {
            await Models.Bill.deleteOne({ id });
            return true;
        } else {
            const db = await this.readJSON();
            const initialLen = db.bills.length;
            db.bills = db.bills.filter(b => b.id !== id);
            if (db.bills.length < initialLen) {
                await this.writeJSON(db);
                return true;
            }
            return false;
        }
    }

    // =========================================================================
    // DOCUMENT METHODS
    // =========================================================================
    async getDocuments(userId: string) {
        await this.init();
        if (this.useMongo) {
            // Need a Document model, assuming it exists or using generic storage
            return []; // Placeholder as model logic is complex
        } else {
            const db = await this.readJSON();
            return db.documents.filter(d => d.tenantId === userId || d.landlordId === userId);
        }
    }

    async getStoredDocuments(userId: string) {
        return this.getDocuments(userId);
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

    async getDocumentById(id: string) {
        await this.init();
        if (this.useMongo) {
            const res = await Models.Document.findOne({ id }).lean();
            return res as unknown as StoredDocument | null;
        } else {
            const db = await this.readJSON();
            return db.documents.find(d => d.id === id) || null;
        }
    }

    async deleteDocument(id: string) {
        await this.init();
        if (this.useMongo) {
            await Models.Document.deleteOne({ id });
            return true;
        } else {
            const db = await this.readJSON();
            const initialLen = db.documents.length;
            db.documents = db.documents.filter(d => d.id !== id);
            await this.writeJSON(db);
            return db.documents.length < initialLen;
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

    async getAllMessagesForUser(userId: string) {
        await this.init();
        if (this.useMongo) {
            const res = await Models.Message.find({
                $or: [
                    { senderId: userId },
                    { receiverId: userId }
                ]
            }).sort({ timestamp: 1 }).lean();
            return res as unknown as Message[];
        } else {
            const db = await this.readJSON();
            return db.messages.filter(m =>
                m.senderId === userId || m.receiverId === userId
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
            results.forEach((r: { _id: string; count: number }) => {
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
    // MAINTENANCE METHODS
    // =========================================================================
    async addMaintenanceRequest(req: MaintenanceRequest) {
        await this.init();
        if (this.useMongo) {
            const res = await Models.MaintenanceRequest.create(req);
            return res.toObject() as unknown as MaintenanceRequest;
        } else {
            const db = await this.readJSON();
            db.maintenanceRequests.push(req);
            await this.writeJSON(db);
            return req;
        }
    }

    async getMaintenanceRequestsByTenant(tenantId: string) {
        await this.init();
        if (this.useMongo) {
            const res = await Models.MaintenanceRequest.find({ tenantId }).sort({ createdAt: -1 }).lean();
            return res as unknown as MaintenanceRequest[];
        } else {
            const db = await this.readJSON();
            return db.maintenanceRequests.filter(r => r.tenantId === tenantId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
    }

    async getMaintenanceRequestsByLandlord(landlordId: string) {
        await this.init();
        if (this.useMongo) {
            const res = await Models.MaintenanceRequest.find({ landlordId }).sort({ createdAt: -1 }).lean();
            return res as unknown as MaintenanceRequest[];
        } else {
            const db = await this.readJSON();
            return db.maintenanceRequests.filter(r => r.landlordId === landlordId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
    }

    async getMaintenanceRequestById(id: string) {
        await this.init();
        if (this.useMongo) {
            const res = await Models.MaintenanceRequest.findOne({ id }).lean();
            return res as unknown as MaintenanceRequest | null;
        } else {
            const db = await this.readJSON();
            return db.maintenanceRequests.find(r => r.id === id) || null;
        }
    }

    async updateMaintenanceRequest(id: string, updates: Partial<MaintenanceRequest>) {
        await this.init();
        if (this.useMongo) {
            const res = await Models.MaintenanceRequest.findOneAndUpdate({ id }, updates, { new: true }).lean();
            return res as unknown as MaintenanceRequest | null;
        } else {
            const db = await this.readJSON();
            const index = db.maintenanceRequests.findIndex(r => r.id === id);
            if (index === -1) return null;
            db.maintenanceRequests[index] = { ...db.maintenanceRequests[index], ...updates, updatedAt: new Date().toISOString() };
            await this.writeJSON(db);
            return db.maintenanceRequests[index];
        }
    }

    // =========================================================================
    // REVIEW METHODS
    // =========================================================================
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

    async getAllReviews() {
        await this.init();
        if (this.useMongo) {
            const res = await Models.Review.find({}).sort({ createdAt: -1 }).lean();
            return res as unknown as Review[];
        } else {
            const db = await this.readJSON();
            return [...db.reviews].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
    }
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

    // =========================================================================
    // SUPPORT METHODS
    // =========================================================================
    async getSupportArticles() {
        await this.init();
        if (this.useMongo) {
            const res = await SupportArticleModel.find({}).lean();
            return res as unknown as SupportArticle[];
        } else {
            await this.readJSON();
            return this.inMemoryCache!.supportArticles;
        }
    }

    async addSupportTicket(ticket: SupportTicket) {
        await this.init();
        if (this.useMongo) {
            const res = await SupportTicketModel.create(ticket);
            return res.toObject() as unknown as SupportTicket;
        } else {
            const db = await this.readJSON();
            db.supportTickets.push(ticket);
            await this.writeJSON(db);
            return ticket;
        }
    }

    async getSupportTickets(landlordId: string) {
        await this.init();
        if (this.useMongo) {
            const res = await SupportTicketModel.find({ landlordId }).sort({ createdAt: -1 }).lean();
            return res as unknown as SupportTicket[];
        } else {
            const db = await this.readJSON();
            return db.supportTickets.filter(t => t.landlordId === landlordId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
    }

    async getAllSupportTickets() {
        await this.init();
        if (this.useMongo) {
            const res = await SupportTicketModel.find({}).sort({ updatedAt: -1 }).lean();
            return res as unknown as SupportTicket[];
        } else {
            const db = await this.readJSON();
            return [...db.supportTickets].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        }
    }

    async findSupportTicketById(id: string) {
        await this.init();
        if (this.useMongo) {
            const res = await SupportTicketModel.findOne({ id }).lean();
            return res as unknown as SupportTicket | null;
        } else {
            const db = await this.readJSON();
            return db.supportTickets.find(t => t.id === id) || null;
        }
    }

    async updateSupportTicket(id: string, updates: Partial<SupportTicket>) {
        await this.init();
        if (this.useMongo) {
            const res = await SupportTicketModel.findOneAndUpdate({ id }, updates, { new: true }).lean();
            return res as unknown as SupportTicket | null;
        } else {
            const db = await this.readJSON();
            const index = db.supportTickets.findIndex(t => t.id === id);
            if (index === -1) return null;
            db.supportTickets[index] = { ...db.supportTickets[index], ...updates, updatedAt: new Date().toISOString() };
            await this.writeJSON(db);
            return db.supportTickets[index];
        }
    }

    // =========================================================================
    // ANNOUNCEMENT METHODS
    // =========================================================================
    async getAnnouncements() {
        await this.init();
        if (this.useMongo) {
            const res = await Models.Announcement.find({}).sort({ date: -1 }).lean();
            return res as unknown as Announcement[];
        } else {
            const db = await this.readJSON();
            return [...db.announcements].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        }
    }

    async addAnnouncement(announcement: Announcement) {
        await this.init();
        if (this.useMongo) {
            const res = await Models.Announcement.create(announcement);
            return res.toObject() as unknown as Announcement;
        } else {
            const db = await this.readJSON();
            db.announcements.push(announcement);
            await this.writeJSON(db);
            return announcement;
        }
    }

    async getPlatformStats() {
        await this.init();
        if (this.useMongo) {
            const [users, properties, tickets, requests, bills] = await Promise.all([
                Models.User.countDocuments({}),
                Models.Property.countDocuments({}),
                SupportTicketModel.countDocuments({ status: { $ne: 'CLOSED' } }),
                Models.VerificationRequest.countDocuments({ status: 'pending' }),
                Models.Bill.find({ status: 'PAID' })
            ]);

            const revenue = bills.reduce((acc, bill) => acc + bill.amount, 0);

            return {
                totalUsers: users,
                totalProperties: properties,
                openTickets: tickets,
                pendingVerifications: requests,
                totalRevenue: revenue
            };
        } else {
            const db = await this.readJSON();
            return {
                totalUsers: db.users.length,
                totalProperties: db.properties.length,
                openTickets: db.supportTickets.filter(t => t.status !== 'CLOSED').length,
                pendingVerifications: db.verificationRequests.filter(r => r.status === 'pending').length,
                totalRevenue: db.bills.filter(b => b.status === 'PAID').reduce((acc, b) => acc + b.amount, 0)
            };
        }
    }
}

export const db = new DBAdapter();
