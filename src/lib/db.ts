import fs from 'fs/promises';
import path from 'path';
import { User, Property, VerificationRequest, TenantHistory, Notification, Bill, Message, Review, TenantStay, MaintenanceRequest, Announcement, SupportArticle, SupportTicket } from '@/lib/types';
import { StoredDocument } from './store';
import { db as firestore } from '@/lib/firebase'; // Firestore
// import * as Models from '@/models';
// import SupportArticleModel from '@/models/SupportArticle';
// import SupportTicketModel from '@/models/SupportTicket';
// import dbConnect from './mongoose'; // Removed

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
    private useFirebase: boolean;
    private inMemoryCache: JSONSchema | null = null;

    constructor() {
        // Always usage Firebase in this new version, fallback to JSON only if env missing (but we have it)
        this.useFirebase = true;
    }

    // HELPER: Init (No-op for Firebase as it inits on import)
    private async init() {
        // Firebase is initialized in @/lib/firebase
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
        if (this.useFirebase) {
            const snapshot = await firestore.collection('users').get();
            return snapshot.docs.map(doc => doc.data() as User);
        } else {
            const db = await this.readJSON();
            return db.users;
        }
    }

    async addUser(user: User) {
        await this.init();
        if (this.useFirebase) {
            // Ensure no undefined values
            const userData = JSON.parse(JSON.stringify(user));
            await firestore.collection('users').doc(user.id).set(userData);
            return user;
        } else {
            const db = await this.readJSON();
            db.users.push(user);
            await this.writeJSON(db);
            return user;
        }
    }

    async findUserByEmail(email: string) {
        await this.init();
        if (this.useFirebase) {
            // Note: This requires an index usually, but for small sets it works. 
            // Better to use normalized email as ID? No, ID is nanoid.
            const snapshot = await firestore.collection('users')
                .where('email', '==', email?.toLowerCase().trim())
                .limit(1)
                .get();

            if (snapshot.empty) return null;
            return snapshot.docs[0].data() as User;
        } else {
            const db = await this.readJSON();
            const searchEmail = email?.toLowerCase().trim();
            return db.users.find(u => (u.email || '').toLowerCase().trim() === searchEmail) || null;
        }
    }

    async findUserById(id: string) {
        await this.init();
        if (this.useFirebase) {
            const doc = await firestore.collection('users').doc(id).get();
            if (!doc.exists) return null;
            return doc.data() as User;
        } else {
            const db = await this.readJSON();
            return db.users.find(u => u.id === id) || null;
        }
    }

    async getLandlords() {
        await this.init();
        if (this.useFirebase) {
            const snapshot = await firestore.collection('users')
                .where('role', '==', 'landlord')
                .get();
            return snapshot.docs.map(doc => {
                const data = doc.data();
                return { id: data.id, name: data.name };
            });
        } else {
            const db = await this.readJSON();
            return db.users
                .filter(u => u.role === 'landlord')
                .map(u => ({ id: u.id, name: u.name }));
        }
    }

    async updateUser(id: string, updates: Partial<User>) {
        await this.init();
        if (this.useFirebase) {
            const userRef = firestore.collection('users').doc(id);
            // Check existence logic handled by update? update fails if doesn't exist.
            // But strict signature return expects User | null.
            const doc = await userRef.get();
            if (!doc.exists) return null;

            const cleanUpdates = JSON.parse(JSON.stringify(updates));
            await userRef.update(cleanUpdates);

            // Return updated
            const updatedDoc = await userRef.get();
            return updatedDoc.data() as User;
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
        if (this.useFirebase) {
            const snapshot = await firestore.collection('verificationRequests').get();
            return snapshot.docs.map(doc => doc.data() as VerificationRequest);
        } else {
            const db = await this.readJSON();
            return db.verificationRequests;
        }
    }

    async findRequestByTenantId(tenantId: string) {
        await this.init();
        if (this.useFirebase) {
            const snapshot = await firestore.collection('verificationRequests')
                .where('tenantId', '==', tenantId)
                .orderBy('submittedAt', 'desc')
                .limit(1)
                .get();

            if (snapshot.empty) return undefined;
            return snapshot.docs[0].data() as VerificationRequest;
        } else {
            const db = await this.readJSON();
            return db.verificationRequests
                .filter(r => r.tenantId === tenantId)
                .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())[0];
        }
    }

    async findRequestById(id: string) {
        await this.init();
        if (this.useFirebase) {
            const doc = await firestore.collection('verificationRequests').doc(id).get();
            if (!doc.exists) return undefined;
            return doc.data() as VerificationRequest;
        } else {
            const db = await this.readJSON();
            return db.verificationRequests.find(r => r.id === id);
        }
    }

    async addRequest(req: VerificationRequest) {
        await this.init();
        if (this.useFirebase) {
            const reqData = JSON.parse(JSON.stringify(req));
            await firestore.collection('verificationRequests').doc(req.id).set(reqData);
            return req;
        } else {
            const db = await this.readJSON();
            db.verificationRequests.push(req);
            await this.writeJSON(db);
            return req;
        }
    }

    async updateRequest(id: string, updates: Partial<VerificationRequest>) {
        await this.init();
        if (this.useFirebase) {
            const ref = firestore.collection('verificationRequests').doc(id);
            const doc = await ref.get();
            if (!doc.exists) return null;

            const cleanUpdates = JSON.parse(JSON.stringify(updates));
            await ref.update(cleanUpdates);

            const updated = await ref.get();
            return updated.data() as VerificationRequest;
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
        if (this.useFirebase) {
            const ref = firestore.collection('verificationRequests').doc(id);
            const doc = await ref.get();
            if (!doc.exists) return null;

            const updates: any = { status, updatedAt: new Date().toISOString() };
            if (remarks !== undefined) updates.remarks = remarks;
            if (extraData) {
                if (extraData.joiningDate) updates.joiningDate = extraData.joiningDate;
                if (extraData.rentNotes) updates.rentNotes = extraData.rentNotes;
                if (extraData.utilityDetails) updates.utilityDetails = extraData.utilityDetails;
            }
            if (status === 'approved') {
                const currentData = doc.data() as VerificationRequest;
                if (!currentData.verifiedAt) updates.verifiedAt = new Date().toISOString();
            }

            await ref.update(JSON.parse(JSON.stringify(updates)));

            const updated = await ref.get();
            return updated.data() as VerificationRequest;
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
        if (this.useFirebase) {
            const data = JSON.parse(JSON.stringify(record));
            // Assuming record has an ID, if not we should probably generate one or use add().
            // But to be safe and consistent with other methods assuming ID presence:
            if (record.id) {
                await firestore.collection('history').doc(record.id).set(data);
            } else {
                const docRef = await firestore.collection('history').add(data);
                // timestamp?
            }
            return record;
        } else {
            const db = await this.readJSON();
            db.history.push(record);
            await this.writeJSON(db);
            return record;
        }
    }

    async getTenantHistory(tenantId: string) {
        await this.init();
        if (this.useFirebase) {
            const snapshot = await firestore.collection('history')
                .where('tenantId', '==', tenantId)
                // .orderBy('date', 'desc') // Needs index
                .get();
            const docs = snapshot.docs.map(d => d.data() as TenantHistory);
            return docs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
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
        if (this.useFirebase) {
            const snapshot = await firestore.collection('notifications')
                .where('userId', '==', userId)
                // .orderBy('createdAt', 'desc') // Needs index
                .get();
            const docs = snapshot.docs.map(d => d.data() as Notification);
            return docs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        } else {
            const db = await this.readJSON();
            return db.notifications.filter(n => n.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
    }

    async addNotification(notification: Notification) {
        await this.init();
        if (this.useFirebase) {
            const data = JSON.parse(JSON.stringify(notification));
            await firestore.collection('notifications').doc(notification.id).set(data);
            return notification;
        } else {
            const db = await this.readJSON();
            db.notifications.push(notification);
            await this.writeJSON(db);
            return notification;
        }
    }

    async updateNotification(id: string, updates: Partial<Notification>) {
        await this.init();
        if (this.useFirebase) {
            const ref = firestore.collection('notifications').doc(id);
            const doc = await ref.get();
            if (!doc.exists) return null;

            await ref.update(JSON.parse(JSON.stringify(updates)));
            const updated = await ref.get();
            return updated.data() as Notification;
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
        if (this.useFirebase) {
            const snapshot = await firestore.collection('notifications')
                .where('userId', '==', userId)
                .where('isRead', '==', false)
                .get();

            const batch = firestore.batch();
            snapshot.docs.forEach(doc => {
                batch.update(doc.ref, { isRead: true });
            });
            await batch.commit();
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
        if (this.useFirebase) {
            const doc = await firestore.collection('properties').doc(id).get();
            if (!doc.exists) return undefined;
            return doc.data() as Property;
        } else {
            const db = await this.readJSON();
            return db.properties.find(p => p.id === id);
        }
    }

    async getProperties(landlordId: string) {
        await this.init();
        if (this.useFirebase) {
            const snapshot = await firestore.collection('properties')
                .where('landlordId', '==', landlordId)
                .get();
            return snapshot.docs.map(doc => doc.data() as Property);
        } else {
            const db = await this.readJSON();
            return db.properties.filter(p => p.landlordId === landlordId);
        }
    }

    async getAllProperties() {
        await this.init();
        if (this.useFirebase) {
            const snapshot = await firestore.collection('properties').get();
            return snapshot.docs.map(doc => doc.data() as Property);
        } else {
            const db = await this.readJSON();
            return db.properties;
        }
    }

    async addProperty(property: Property) {
        await this.init();
        if (this.useFirebase) {
            const propData = JSON.parse(JSON.stringify(property));
            await firestore.collection('properties').doc(property.id).set(propData);
            return property;
        } else {
            const db = await this.readJSON();
            db.properties.push(property);
            await this.writeJSON(db);
            return property;
        }
    }

    async deleteProperty(id: string) {
        await this.init();
        if (this.useFirebase) {
            await firestore.collection('properties').doc(id).delete();
        } else {
            const db = await this.readJSON();
            db.properties = db.properties.filter(p => p.id !== id);
            await this.writeJSON(db);
        }
    }

    async updateProperty(id: string, updates: Partial<Property>) {
        await this.init();
        if (this.useFirebase) {
            const ref = firestore.collection('properties').doc(id);
            const doc = await ref.get();
            if (!doc.exists) return null;

            const cleanUpdates = JSON.parse(JSON.stringify(updates));
            await ref.update(cleanUpdates);

            const updated = await ref.get();
            return updated.data() as Property;
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
        if (this.useFirebase) {
            const data = JSON.parse(JSON.stringify(stay));
            await firestore.collection('tenantStays').doc(stay.tenantId).set(data); // using tenantId as ID or random? 
            // Stay ID is technically unique but here it seems we track by tenantId mostly?
            // Actually `stay` object doesn't strictly have a unique ID field in type maybe?
            // Assuming it has an 'id' field if we used create() before.
            // If it doesn't have an ID, we should generate one or use tenantId if 1-1 active stay.
            // Staying consistent with current use: Mongoose auto-gen _id, but here staying safe.
            // Let's assume stay has an ID or we create one?
            // Models.TenantStay would create an _id. 
            // But we don't seem to pass an ID in `stay`.
            // We should auto-generate ID if missing.
            if (!stay.id) {
                // @ts-ignore
                stay.id = (await firestore.collection('tenantStays').add(data)).id;
                // Wait, .add() adds doc.
                // Let's just use add() and let auto-id happen, IF stay doesn't have ID.
                // But typically we want control.
            } else {
                await firestore.collection('tenantStays').doc(stay.id).set(data);
            }
            return stay;
        } else {
            const db = await this.readJSON();
            db.tenantStays.push(stay);
            await this.writeJSON(db);
            return stay;
        }
    }

    async endTenantStay(tenantId: string) {
        await this.init();
        if (this.useFirebase) {
            const snapshot = await firestore.collection('tenantStays')
                .where('tenantId', '==', tenantId)
                .where('status', '==', 'ACTIVE')
                .get();

            if (snapshot.empty) return null;

            const doc = snapshot.docs[0];
            const updates = {
                status: 'MOVED_OUT',
                moveOutDate: new Date().toISOString()
            };
            await doc.ref.update(updates);
            return { ...doc.data(), ...updates } as TenantStay;
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
        if (this.useFirebase) {
            const snapshot = await firestore.collection('tenantStays')
                .where('tenantId', '==', tenantId)
                .where('status', '==', 'ACTIVE')
                .get();
            if (snapshot.empty) return undefined;
            return snapshot.docs[0].data() as TenantStay;
        } else {
            const db = await this.readJSON();
            return db.tenantStays.find(s => s.tenantId === tenantId && s.status === 'ACTIVE');
        }
    }

    async getLandlordTenants(landlordId: string) {
        await this.init();
        if (this.useFirebase) {
            const snapshot = await firestore.collection('tenantStays')
                .where('landlordId', '==', landlordId)
                .where('status', '==', 'ACTIVE')
                .get();

            const stays = snapshot.docs.map(doc => doc.data() as TenantStay);

            const results = await Promise.all(stays.map(async (stay) => {
                const tenantDoc = await firestore.collection('users').doc(stay.tenantId).get();
                const propertyDoc = await firestore.collection('properties').doc(stay.propertyId).get();
                const tenant = tenantDoc.exists ? tenantDoc.data() as User : null;
                const property = propertyDoc.exists ? propertyDoc.data() as Property : null;

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
        if (this.useFirebase) {
            const data = JSON.parse(JSON.stringify(bill));
            await firestore.collection('bills').doc(bill.id).set(data);
            return bill;
        } else {
            const db = await this.readJSON();
            db.bills.push(bill);
            await this.writeJSON(db);
            return bill;
        }
    }

    async getBillsByLandlord(landlordId: string) {
        await this.init();
        if (this.useFirebase) {
            const snapshot = await firestore.collection('bills')
                .where('landlordId', '==', landlordId)
                .get();
            return snapshot.docs.map(doc => doc.data() as Bill);
        } else {
            const db = await this.readJSON();
            return db.bills.filter(b => b.landlordId === landlordId);
        }
    }

    async getBillsByTenant(tenantId: string) {
        await this.init();
        if (this.useFirebase) {
            const snapshot = await firestore.collection('bills')
                .where('tenantId', '==', tenantId)
                .get();
            return snapshot.docs.map(doc => doc.data() as Bill);
        } else {
            const db = await this.readJSON();
            return db.bills.filter(b => b.tenantId === tenantId);
        }
    }

    async payBill(billId: string) {
        await this.init();
        if (this.useFirebase) {
            const ref = firestore.collection('bills').doc(billId);
            const doc = await ref.get();
            if (!doc.exists) return null;

            const updates = {
                status: 'PAID',
                paidAt: new Date().toISOString()
            };
            await ref.update(updates);
            return { ...doc.data(), ...updates } as any as Bill;
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
        if (this.useFirebase) {
            await firestore.collection('bills').doc(id).delete();
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
        if (this.useFirebase) {
            // Complex OR query needed: tenantId == userId OR landlordId == userId
            // Firestore does not support OR queries across different fields easily in older SDKs (it does now with 'whereFilter' or multiple queries).
            // Simple fallback: query twice and merge? Or assuming documents stored by one user mainly.
            // Actually, documents usually have both.
            // Let's rely on two queries.
            const q1 = await firestore.collection('documents').where('tenantId', '==', userId).get();
            const q2 = await firestore.collection('documents').where('landlordId', '==', userId).get();

            const docs1 = q1.docs.map(d => d.data() as StoredDocument);
            const docs2 = q2.docs.map(d => d.data() as StoredDocument);

            // Deduplicate
            const map = new Map();
            docs1.forEach(d => map.set(d.id, d));
            docs2.forEach(d => map.set(d.id, d));
            return Array.from(map.values());
        } else {
            const db = await this.readJSON();
            return db.documents.filter(d => d.tenantId === userId || d.landlordId === userId);
        }
    }

    async getStoredDocuments(userId: string) {
        return this.getDocuments(userId);
    }

    async addDocument(doc: StoredDocument) {
        await this.init();
        if (this.useFirebase) {
            const data = JSON.parse(JSON.stringify(doc));
            await firestore.collection('documents').doc(doc.id).set(data);
            return doc;
        } else {
            const db = await this.readJSON();
            db.documents.push(doc);
            await this.writeJSON(db);
            return doc;
        }
    }

    async getDocumentsByLandlord(landlordId: string) {
        await this.init();
        if (this.useFirebase) {
            const snapshot = await firestore.collection('documents').where('landlordId', '==', landlordId).get();
            return snapshot.docs.map(d => d.data() as StoredDocument);
        } else {
            const db = await this.readJSON();
            return db.documents.filter(d => d.landlordId === landlordId);
        }
    }

    async getDocumentsByTenant(tenantId: string) {
        await this.init();
        if (this.useFirebase) {
            const snapshot = await firestore.collection('documents').where('tenantId', '==', tenantId).get();
            return snapshot.docs.map(d => d.data() as StoredDocument);
        } else {
            const db = await this.readJSON();
            return db.documents.filter(d => d.tenantId === tenantId);
        }
    }

    async getDocumentById(id: string) {
        await this.init();
        if (this.useFirebase) {
            const doc = await firestore.collection('documents').doc(id).get();
            return doc.exists ? doc.data() as StoredDocument : null;
        } else {
            const db = await this.readJSON();
            return db.documents.find(d => d.id === id) || null;
        }
    }

    async deleteDocument(id: string) {
        await this.init();
        if (this.useFirebase) {
            await firestore.collection('documents').doc(id).delete();
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
        if (this.useFirebase) {
            const data = JSON.parse(JSON.stringify(message));
            // Messages usually don't have ID when passed here? 
            // Type definition says id is string.
            await firestore.collection('messages').doc(message.id).set(data);
            return message;
        } else {
            const db = await this.readJSON();
            db.messages.push(message);
            await this.writeJSON(db);
            return message;
        }
    }

    async getMessages(userId1: string, userId2: string) {
        await this.init();
        if (this.useFirebase) {
            // Firestore complex query OR?
            // (sender==u1 && receiver==u2) OR (sender==u2 && receiver==u1)
            // Two queries.
            const q1 = await firestore.collection('messages')
                .where('senderId', '==', userId1).where('receiverId', '==', userId2)
                .get();

            const q2 = await firestore.collection('messages')
                .where('senderId', '==', userId2).where('receiverId', '==', userId1)
                .get();

            const allDocs = [...q1.docs, ...q2.docs].map(d => d.data() as Message);
            // Sort
            return allDocs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
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
        if (this.useFirebase) {
            const q1 = await firestore.collection('messages').where('senderId', '==', userId).get();
            const q2 = await firestore.collection('messages').where('receiverId', '==', userId).get();

            const map = new Map();
            q1.docs.forEach(d => map.set(d.id, d.data() as Message));
            q2.docs.forEach(d => map.set(d.id, d.data() as Message));

            const all = Array.from(map.values()) as Message[];
            return all.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        } else {
            const db = await this.readJSON();
            return db.messages.filter(m =>
                m.senderId === userId || m.receiverId === userId
            ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        }
    }

    async markMessagesAsRead(senderId: string, receiverId: string) {
        await this.init();
        if (this.useFirebase) {
            const snapshot = await firestore.collection('messages')
                .where('senderId', '==', senderId)
                .where('receiverId', '==', receiverId)
                .where('isRead', '==', false)
                .get();

            const batch = firestore.batch();
            snapshot.docs.forEach(doc => {
                batch.update(doc.ref, { isRead: true });
            });
            await batch.commit();
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
        if (this.useFirebase) {
            const snapshot = await firestore.collection('messages')
                .where('receiverId', '==', userId)
                .where('isRead', '==', false)
                .count() // .count() is available in newer SDKs, or just get().size
                .get();
            return snapshot.data().count;
        } else {
            const db = await this.readJSON();
            return db.messages.filter(m => m.receiverId === userId && !m.isRead).length;
        }
    }

    async getUnreadCountsBySender(userId: string) {
        await this.init();
        if (this.useFirebase) {
            const snapshot = await firestore.collection('messages')
                .where('receiverId', '==', userId)
                .where('isRead', '==', false)
                .get();

            const counts: { [key: string]: number } = {};
            snapshot.docs.forEach(doc => {
                const data = doc.data() as Message;
                counts[data.senderId] = (counts[data.senderId] || 0) + 1;
            });

            return Object.entries(counts).map(([senderId, count]) => ({ _id: senderId, count }));
        } else {
            const db = await this.readJSON();
            const counts: { [key: string]: number } = {};
            db.messages
                .filter(m => m.receiverId === userId && !m.isRead)
                .forEach(m => {
                    counts[m.senderId] = (counts[m.senderId] || 0) + 1;
                });
            return Object.entries(counts).map(([id, count]) => ({ _id: id, count }));
        }
    }

    // =========================================================================
    // MAINTENANCE METHODS
    // =========================================================================
    async addMaintenanceRequest(req: MaintenanceRequest) {
        await this.init();
        if (this.useFirebase) {
            const data = JSON.parse(JSON.stringify(req));
            await firestore.collection('maintenanceRequests').doc(req.id).set(data);
            return req;
        } else {
            const db = await this.readJSON();
            db.maintenanceRequests.push(req);
            await this.writeJSON(db);
            return req;
        }
    }

    async getMaintenanceRequestsByTenant(tenantId: string) {
        await this.init();
        if (this.useFirebase) {
            const snapshot = await firestore.collection('maintenanceRequests')
                .where('tenantId', '==', tenantId)
                // .orderBy('createdAt', 'desc') // Requires index
                .get();
            const docs = snapshot.docs.map(d => d.data() as MaintenanceRequest);
            return docs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        } else {
            const db = await this.readJSON();
            return db.maintenanceRequests.filter(r => r.tenantId === tenantId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
    }

    async getMaintenanceRequestsByLandlord(landlordId: string) {
        await this.init();
        if (this.useFirebase) {
            const snapshot = await firestore.collection('maintenanceRequests')
                .where('landlordId', '==', landlordId)
                .get();
            const docs = snapshot.docs.map(d => d.data() as MaintenanceRequest);
            return docs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        } else {
            const db = await this.readJSON();
            return db.maintenanceRequests.filter(r => r.landlordId === landlordId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
    }

    async getMaintenanceRequestById(id: string) {
        await this.init();
        if (this.useFirebase) {
            const doc = await firestore.collection('maintenanceRequests').doc(id).get();
            return doc.exists ? doc.data() as MaintenanceRequest : null;
        } else {
            const db = await this.readJSON();
            return db.maintenanceRequests.find(r => r.id === id) || null;
        }
    }

    async updateMaintenanceRequest(id: string, updates: Partial<MaintenanceRequest>) {
        await this.init();
        if (this.useFirebase) {
            const ref = firestore.collection('maintenanceRequests').doc(id);
            const doc = await ref.get();
            if (!doc.exists) return null;

            await ref.update(JSON.parse(JSON.stringify(updates)));
            const updated = await ref.get();
            return updated.data() as MaintenanceRequest;
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
        if (this.useFirebase) {
            const snapshot = await firestore.collection('reviews').where('revieweeId', '==', userId).get();
            const docs = snapshot.docs.map(d => d.data() as Review);
            return docs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        } else {
            const db = await this.readJSON();
            return db.reviews.filter(r => r.revieweeId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
    }

    async getAllReviews() {
        await this.init();
        if (this.useFirebase) {
            const snapshot = await firestore.collection('reviews').get();
            const docs = snapshot.docs.map(d => d.data() as Review);
            return docs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        } else {
            const db = await this.readJSON();
            return [...db.reviews].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
    }
    async addReview(review: Review) {
        await this.init();
        if (this.useFirebase) {
            const data = JSON.parse(JSON.stringify(review));
            await firestore.collection('reviews').doc(review.id).set(data);
            return review;
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
        if (this.useFirebase) {
            const snapshot = await firestore.collection('supportArticles').get();
            return snapshot.docs.map(d => d.data() as SupportArticle);
        } else {
            await this.readJSON();
            return this.inMemoryCache!.supportArticles;
        }
    }

    async addSupportTicket(ticket: SupportTicket) {
        await this.init();
        if (this.useFirebase) {
            const data = JSON.parse(JSON.stringify(ticket));
            await firestore.collection('supportTickets').doc(ticket.id).set(data);
            return ticket;
        } else {
            const db = await this.readJSON();
            db.supportTickets.push(ticket);
            await this.writeJSON(db);
            return ticket;
        }
    }

    async getSupportTickets(landlordId: string) {
        await this.init();
        if (this.useFirebase) {
            const snapshot = await firestore.collection('supportTickets').where('landlordId', '==', landlordId).get();
            return snapshot.docs.map(d => d.data() as SupportTicket);
        } else {
            const db = await this.readJSON();
            return db.supportTickets.filter(t => t.landlordId === landlordId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
    }

    async getAllSupportTickets() {
        await this.init();
        if (this.useFirebase) {
            const snapshot = await firestore.collection('supportTickets').get();
            return snapshot.docs.map(d => d.data() as SupportTicket);
        } else {
            const db = await this.readJSON();
            return [...db.supportTickets].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        }
    }

    async findSupportTicketById(id: string) {
        await this.init();
        if (this.useFirebase) {
            const doc = await firestore.collection('supportTickets').doc(id).get();
            return doc.exists ? doc.data() as SupportTicket : null;
        } else {
            const db = await this.readJSON();
            return db.supportTickets.find(t => t.id === id) || null;
        }
    }

    async updateSupportTicket(id: string, updates: Partial<SupportTicket>) {
        await this.init();
        if (this.useFirebase) {
            const ref = firestore.collection('supportTickets').doc(id);
            const doc = await ref.get();
            if (!doc.exists) return null;

            await ref.update(JSON.parse(JSON.stringify(updates)));
            const updated = await ref.get();
            return updated.data() as SupportTicket;
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
        if (this.useFirebase) {
            const snapshot = await firestore.collection('announcements').get(); // Order by date?
            const docs = snapshot.docs.map(d => d.data() as Announcement);
            return docs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        } else {
            const db = await this.readJSON();
            return [...db.announcements].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        }
    }

    async addAnnouncement(announcement: Announcement) {
        await this.init();
        if (this.useFirebase) {
            const data = JSON.parse(JSON.stringify(announcement));
            await firestore.collection('announcements').doc(announcement.id).set(data);
            return announcement;
        } else {
            const db = await this.readJSON();
            db.announcements.push(announcement);
            await this.writeJSON(db);
            return announcement;
        }
    }

    async getPlatformStats() {
        await this.init();
        if (this.useFirebase) {
            // Aggregation Queries (count)
            const users = (await firestore.collection('users').count().get()).data().count;
            const properties = (await firestore.collection('properties').count().get()).data().count;
            const tickets = (await firestore.collection('supportTickets').count().get()).data().count;
            const requests = (await firestore.collection('verificationRequests').count().get()).data().count;
            const bills = (await firestore.collection('bills').count().get()).data().count;

            return {
                totalUsers: users,
                totalProperties: properties,
                openTickets: tickets,
                pendingVerifications: requests,
                totalRevenue: 0 // Placeholder
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

    async getDebugStatus() {
        await this.init();
        return {
            usingFirebase: this.useFirebase,
            inMemoryCacheSize: this.inMemoryCache ? Object.keys(this.inMemoryCache).length : 0,
            dbPath: DB_PATH
        };
    }
}

export const db = new DBAdapter();
