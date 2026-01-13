import fs from 'fs/promises';
import path from 'path';
import { User, Property, VerificationRequest, TenantHistory, Notification, Bill, Message, Review, TenantStay } from '@/lib/types';
import { StoredDocument } from './store';

// Re-export types
export type { User, Property, VerificationRequest, TenantHistory, Notification, Bill, Message, Review, TenantStay };

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');

interface DBSchema {
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

class DBAdapter {
    private async readDB(): Promise<DBSchema> {
        try {
            const data = await fs.readFile(DB_PATH, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            // If file doesn't exist, return empty schema
            const emptyDB: DBSchema = {
                users: [],
                properties: [],
                verificationRequests: [],
                history: [],
                notifications: [],
                bills: [],
                documents: [],
                messages: [],
                reviews: [],
                tenantStays: []
            };
            await this.writeDB(emptyDB);
            return emptyDB;
        }
    }

    private async writeDB(data: DBSchema): Promise<void> {
        await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
    }

    // USER METHODS
    async getUsers() {
        const db = await this.readDB();
        return db.users;
    }

    async addUser(user: User) {
        const db = await this.readDB();
        db.users.push(user);
        await this.writeDB(db);
        return user;
    }

    async findUserByEmail(email: string) {
        const db = await this.readDB();
        return db.users.find(u => u.email === email) || null;
    }

    async findUserById(id: string) {
        const db = await this.readDB();
        return db.users.find(u => u.id === id) || null;
    }

    async getLandlords() {
        const db = await this.readDB();
        return db.users
            .filter(u => u.role === 'landlord')
            .map(u => ({ id: u.id, name: u.name }));
    }

    async updateUser(id: string, updates: Partial<User>) {
        const db = await this.readDB();
        const index = db.users.findIndex(u => u.id === id);
        if (index === -1) return null;

        db.users[index] = { ...db.users[index], ...updates };
        await this.writeDB(db);
        return db.users[index];
    }

    // VERIFICATION REQUEST METHODS
    async getRequests() {
        const db = await this.readDB();
        return db.verificationRequests;
    }

    async findRequestByTenantId(tenantId: string) {
        const db = await this.readDB();
        // Return latest submitted request
        return db.verificationRequests
            .filter(r => r.tenantId === tenantId)
            .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())[0];
    }

    async findRequestById(id: string) {
        const db = await this.readDB();
        return db.verificationRequests.find(r => r.id === id);
    }

    async addRequest(req: VerificationRequest) {
        const db = await this.readDB();
        db.verificationRequests.push(req);
        await this.writeDB(db);
        return req;
    }

    async updateRequest(id: string, updates: Partial<VerificationRequest>) {
        const db = await this.readDB();
        const index = db.verificationRequests.findIndex(r => r.id === id);
        if (index === -1) return null;

        db.verificationRequests[index] = { ...db.verificationRequests[index], ...updates };
        await this.writeDB(db);
        return db.verificationRequests[index];
    }

    async updateRequestStatus(id: string, status: 'approved' | 'rejected' | 'moved_out', remarks?: string, extraData?: { joiningDate?: string, rentNotes?: string, utilityDetails?: string }) {
        const db = await this.readDB();
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
        await this.writeDB(db);
        return request;
    }

    // HISTORY METHODS
    async addHistory(record: TenantHistory) {
        const db = await this.readDB();
        db.history.push(record);
        await this.writeDB(db);
        return record;
    }

    async getTenantHistory(tenantId: string) {
        const db = await this.readDB();
        return db.history.filter(h => h.tenantId === tenantId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }

    // NOTIFICATION METHODS
    async getNotifications(userId: string) {
        const db = await this.readDB();
        return db.notifications.filter(n => n.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    async addNotification(notification: Notification) {
        const db = await this.readDB();
        db.notifications.push(notification);
        await this.writeDB(db);
        return notification;
    }

    async updateNotification(id: string, updates: Partial<Notification>) {
        const db = await this.readDB();
        const index = db.notifications.findIndex(n => n.id === id);
        if (index === -1) return null;

        db.notifications[index] = { ...db.notifications[index], ...updates };
        await this.writeDB(db);
        return db.notifications[index];
    }

    async markAllNotificationsAsRead(userId: string) {
        const db = await this.readDB();
        db.notifications = db.notifications.map(n =>
            n.userId === userId ? { ...n, isRead: true } : n
        );
        await this.writeDB(db);
    }

    // PROPERTY METHODS
    async findPropertyById(id: string) {
        const db = await this.readDB();
        return db.properties.find(p => p.id === id);
    }

    async getProperties(landlordId: string) {
        const db = await this.readDB();
        return db.properties.filter(p => p.landlordId === landlordId);
    }

    async getAllProperties() {
        const db = await this.readDB();
        return db.properties;
    }

    async addProperty(property: Property) {
        const db = await this.readDB();
        db.properties.push(property);
        await this.writeDB(db);
        return property;
    }

    async deleteProperty(id: string) {
        const db = await this.readDB();
        db.properties = db.properties.filter(p => p.id !== id);
        await this.writeDB(db);
    }

    async updateProperty(id: string, updates: Partial<Property>) {
        const db = await this.readDB();
        const index = db.properties.findIndex(p => p.id === id);
        if (index === -1) return null;

        db.properties[index] = { ...db.properties[index], ...updates };
        await this.writeDB(db);
        return db.properties[index];
    }

    // TENANT STAY METHODS
    async addTenantStay(stay: TenantStay) {
        const db = await this.readDB();
        db.tenantStays.push(stay);
        await this.writeDB(db);
        return stay;
    }

    async endTenantStay(tenantId: string) {
        const db = await this.readDB();
        const index = db.tenantStays.findIndex(s => s.tenantId === tenantId && s.status === 'ACTIVE');
        if (index !== -1) {
            db.tenantStays[index].status = 'MOVED_OUT';
            db.tenantStays[index].moveOutDate = new Date().toISOString();
            await this.writeDB(db);
            return db.tenantStays[index];
        }
        return null;
    }

    async getTenantStay(tenantId: string) {
        const db = await this.readDB();
        return db.tenantStays.find(s => s.tenantId === tenantId && s.status === 'ACTIVE');
    }

    async getLandlordTenants(landlordId: string) {
        const db = await this.readDB();
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

    // BILL METHODS
    async addBill(bill: Bill) {
        const db = await this.readDB();
        db.bills.push(bill);
        await this.writeDB(db);
        return bill;
    }

    async getBillsByLandlord(landlordId: string) {
        const db = await this.readDB();
        return db.bills.filter(b => b.landlordId === landlordId);
    }

    async getBillsByTenant(tenantId: string) {
        const db = await this.readDB();
        return db.bills.filter(b => b.tenantId === tenantId);
    }

    async payBill(billId: string) {
        const db = await this.readDB();
        const index = db.bills.findIndex(b => b.id === billId);
        if (index !== -1) {
            db.bills[index].status = 'PAID';
            db.bills[index].paidAt = new Date().toISOString();

            // Add history
            db.history.push({
                id: Math.random().toString(36).substr(2, 9),
                tenantId: db.bills[index].tenantId,
                type: 'PAYMENT',
                date: new Date().toISOString(),
                description: `Paid ${db.bills[index].type} bill`,
                amount: db.bills[index].amount,
                createdBy: db.bills[index].tenantId
            });

            await this.writeDB(db);
            return db.bills[index];
        }
        return null;
    }

    async deleteBill(billId: string) {
        const db = await this.readDB();
        const initialLength = db.bills.length;
        db.bills = db.bills.filter(b => b.id !== billId);
        await this.writeDB(db);
        return db.bills.length < initialLength;
    }

    // DOCUMENT METHODS
    async addDocument(doc: StoredDocument) {
        const db = await this.readDB();
        db.documents.push(doc);
        await this.writeDB(db);
        return doc;
    }

    async getDocumentsByLandlord(landlordId: string) {
        const db = await this.readDB();
        return db.documents.filter(d => d.landlordId === landlordId);
    }

    async getDocumentsByTenant(tenantId: string) {
        const db = await this.readDB();
        return db.documents.filter(d => d.tenantId === tenantId);
    }

    // MESSAGE METHODS
    async addMessage(message: Message) {
        const db = await this.readDB();
        db.messages.push(message);
        await this.writeDB(db);
        return message;
    }

    async getMessages(userId1: string, userId2: string) {
        const db = await this.readDB();
        return db.messages.filter(m =>
            (m.senderId === userId1 && m.receiverId === userId2) ||
            (m.senderId === userId2 && m.receiverId === userId1)
        ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    }

    async markMessagesAsRead(senderId: string, receiverId: string) {
        const db = await this.readDB();
        let changed = false;
        db.messages = db.messages.map(m => {
            if (m.senderId === senderId && m.receiverId === receiverId && !m.isRead) {
                changed = true;
                return { ...m, isRead: true };
            }
            return m;
        });
        if (changed) await this.writeDB(db);
    }

    async getUnreadCount(userId: string) {
        const db = await this.readDB();
        return db.messages.filter(m => m.receiverId === userId && !m.isRead).length;
    }

    async getUnreadCountsBySender(userId: string) {
        const db = await this.readDB();
        const counts: Record<string, number> = {};
        db.messages.forEach(m => {
            if (m.receiverId === userId && !m.isRead) {
                counts[m.senderId] = (counts[m.senderId] || 0) + 1;
            }
        });
        return counts;
    }

    // REVIEW METHODS
    async addReview(review: Review) {
        const db = await this.readDB();
        db.reviews.push(review);
        await this.writeDB(db);
        return review;
    }

    async getReviews(userId: string) {
        const db = await this.readDB();
        return db.reviews.filter(r => r.revieweeId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
}

export const db = new DBAdapter();
