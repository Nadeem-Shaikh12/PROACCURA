import fs from 'fs';
import path from 'path';
import { StoredDocument } from './store';

const DB_PATH = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_PATH, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(DB_PATH)) {
    fs.mkdirSync(DB_PATH, { recursive: true });
}

export interface User {
    id: string;
    name: string;
    email: string;
    passwordHash: string;
    role: 'landlord' | 'tenant';
    tenantProfile?: {
        mobile: string;
        city: string;
        state: string;
        aadhaarNumber: string;
        isProfileComplete: boolean;
        paymentStatus: 'PENDING' | 'PAID';
    };
}

export interface Property {
    id: string;
    landlordId: string;
    name: string;
    address: string;
    units: number;
    occupiedUnits: number;
    vacantUnits?: number; // Optional, can be calculated
    monthlyRent: number;
    type: 'Apartment' | 'House' | 'Shop' | 'Other';
    createdAt: string;
}

export interface VerificationRequest {
    id: string;
    tenantId: string;
    fullName: string;
    mobile: string;
    idProofType: 'Aadhaar' | 'Passport' | 'Other';
    idProofNumber: string;
    city: string;
    landlordId: string;
    propertyId?: string; // Link to a specific property
    status: 'pending' | 'approved' | 'rejected' | 'moved_out';
    paymentStatus?: 'pending' | 'paid';
    paymentAmount?: number;
    transactionId?: string;
    remarks?: string;
    submittedAt: string;
    updatedAt?: string;
    verifiedAt?: string;
    joiningDate?: string;
    rentNotes?: string;
    utilityDetails?: string;
}

export interface TenantHistory {
    id: string;
    tenantId: string;
    type: 'JOINED' | 'LIGHT_BILL' | 'REMARK' | 'RENT_PAYMENT' | 'MOVE_OUT' | 'PAYMENT';
    description: string;
    amount?: number;
    month?: string;
    year?: string;
    units?: number;
    status?: 'paid' | 'pending';
    date: string;
    createdBy: string; // landlordId
}

export interface Notification {
    id: string;
    userId: string;
    role: 'landlord' | 'tenant';
    title: string;
    message: string;
    type: 'MONTH_COMPLETED' | 'NEW_BILL_CYCLE' | 'PAYMENT_PENDING' | 'PAYMENT_RECEIVED' | 'REMARK_ADDED';
    isRead: boolean;
    createdAt: string;
}



export interface Bill {
    id: string;
    stayId: string;
    tenantId: string;
    landlordId: string;
    amount: number;
    type: 'RENT' | 'ELECTRICITY' | 'WATER' | 'MAINTENANCE' | 'OTHER';
    month: string; // "December 2025"
    units?: number; // Consumed units for utility bills
    dueDate: string;
    status: 'PENDING' | 'PAID' | 'OVERDUE';
    paidAt?: string;
}

// StoredDocument moved to ./store.ts

export interface Message {
    id: string;
    senderId: string;
    receiverId: string;
    content: string;
    timestamp: string;
    isRead: boolean;
    type: 'text' | 'template' | 'system';
}


interface DB {
    users: User[];
    verificationRequests: VerificationRequest[];
    tenantStays: TenantStay[];
    history: TenantHistory[];
    notifications: Notification[];
    properties: Property[];
    bills: Bill[];
    documents: StoredDocument[];
    messages: Message[];
}



export interface TenantStay {
    id: string; // stay_id
    tenantId: string;
    landlordId: string;
    propertyId: string;
    joinDate: string;
    moveOutDate?: string;
    status: 'ACTIVE' | 'MOVED_OUT';
}

class DBAdapter {
    private dbPath = path.join(process.cwd(), 'data', 'db.json');
    private data: DB = { users: [], verificationRequests: [], tenantStays: [], history: [], notifications: [], properties: [], bills: [], documents: [], messages: [] };

    constructor() {
        this.init();
    }

    private init() {
        if (!fs.existsSync(path.dirname(this.dbPath))) {
            fs.mkdirSync(path.dirname(this.dbPath), { recursive: true });
        }
        if (!fs.existsSync(this.dbPath)) {
            this.writeDB();
        } else {
            this.readDB();
        }
    }

    private readDB() {
        try {
            const fileContent = fs.readFileSync(this.dbPath, 'utf-8');
            const parsed = JSON.parse(fileContent);
            this.data = {
                users: parsed.users || [],
                verificationRequests: parsed.verificationRequests || [],
                tenantStays: parsed.tenantStays || [],
                history: parsed.history || [],
                notifications: parsed.notifications || [],
                properties: parsed.properties || [],
                bills: parsed.bills || [],
                documents: parsed.documents || [],
                messages: parsed.messages || []
            };
        } catch (error) {
            // If file is corrupted or empty, initialize with empty data
            this.data = { users: [], verificationRequests: [], tenantStays: [], history: [], notifications: [], properties: [], bills: [], documents: [], messages: [] };
        }
    }

    private writeDB() {
        fs.writeFileSync(this.dbPath, JSON.stringify(this.data, null, 2));
    }

    // USER METHODS
    getUsers() {
        this.readDB();
        return this.data.users;
    }

    addUser(user: User) {
        this.readDB();
        this.data.users.push(user);
        this.writeDB();
        return user;
    }

    findUserByEmail(email: string) {
        this.readDB();
        return this.data.users.find(u => u.email === email);
    }

    findUserById(id: string) {
        this.readDB();
        return this.data.users.find(u => u.id === id);
    }

    getLandlords() {
        this.readDB();
        // Exclude passwordHash from landlord data returned
        return this.data.users.filter(u => u.role === 'landlord').map(u => ({ id: u.id, name: u.name }));
    }

    updateUser(id: string, updates: Partial<User>) {
        this.readDB();
        const index = this.data.users.findIndex(u => u.id === id);
        if (index !== -1) {
            this.data.users[index] = { ...this.data.users[index], ...updates };
            this.writeDB();
            return this.data.users[index];
        }
        return null;
    }

    // VERIFICATION REQUEST METHODS
    getRequests() {
        this.readDB();
        return this.data.verificationRequests;
    }

    findRequestByTenantId(tenantId: string) {
        this.readDB();
        return this.data.verificationRequests.find(r => r.tenantId === tenantId);
    }

    findRequestById(id: string) {
        this.readDB();
        return this.data.verificationRequests.find(r => r.id === id);
    }

    addRequest(req: VerificationRequest) {
        this.readDB();
        this.data.verificationRequests.push(req);
        this.writeDB();
        return req;
    }

    updateRequest(id: string, updates: Partial<VerificationRequest>) {
        this.readDB();
        const index = this.data.verificationRequests.findIndex(r => r.id === id);
        if (index !== -1) {
            const updatedReq = { ...this.data.verificationRequests[index] };

            (Object.keys(updates) as (keyof VerificationRequest)[]).forEach(key => {
                if (updates[key] !== undefined) {
                    // @ts-ignore - TypeScript struggles with dynamic key assignment on partials
                    updatedReq[key] = updates[key];
                }
            });

            this.data.verificationRequests[index] = updatedReq;
            this.writeDB();
            return this.data.verificationRequests[index];
        }
        return null;
    }

    // This method replaces the old updateRequestStatus
    updateRequestStatus(id: string, status: 'approved' | 'rejected' | 'moved_out', remarks?: string, extraData?: { joiningDate?: string, rentNotes?: string, utilityDetails?: string }) {
        this.readDB();
        const reqIndex = this.data.verificationRequests.findIndex(r => r.id === id);
        if (reqIndex !== -1) {
            const currentRequest = this.data.verificationRequests[reqIndex];
            currentRequest.status = status;

            if (remarks !== undefined) {
                currentRequest.remarks = remarks;
            }

            if (extraData) {
                if (extraData.joiningDate !== undefined) currentRequest.joiningDate = extraData.joiningDate;
                if (extraData.rentNotes !== undefined) currentRequest.rentNotes = extraData.rentNotes;
                if (extraData.utilityDetails !== undefined) currentRequest.utilityDetails = extraData.utilityDetails;
            }

            currentRequest.updatedAt = new Date().toISOString();
            if (status === 'approved' && !currentRequest.verifiedAt) {
                currentRequest.verifiedAt = new Date().toISOString();
            }

            this.writeDB();
            return currentRequest;
        }
        return null;
    }

    // HISTORY METHODS
    addHistory(record: TenantHistory) {
        this.readDB();
        this.data.history.push(record);
        this.writeDB();
        return record;
    }

    getTenantHistory(tenantId: string) {
        this.readDB();
        return this.data.history
            .filter(h => h.tenantId === tenantId)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }

    // NOTIFICATION METHODS
    getNotifications(userId: string) {
        this.readDB();
        return this.data.notifications
            .filter(n => n.userId === userId)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    addNotification(notification: Notification) {
        this.readDB();
        this.data.notifications.push(notification);
        this.writeDB();
        return notification;
    }

    updateNotification(id: string, updates: Partial<Notification>) {
        this.readDB();
        const index = this.data.notifications.findIndex(n => n.id === id);
        if (index !== -1) {
            this.data.notifications[index] = { ...this.data.notifications[index], ...updates };
            this.writeDB();
            return this.data.notifications[index];
        }
        return null;
    }

    markAllNotificationsAsRead(userId: string) {
        this.readDB();
        this.data.notifications = this.data.notifications.map(n =>
            n.userId === userId ? { ...n, isRead: true } : n
        );
        this.writeDB();
    }

    // PROPERTY METHODS
    findPropertyById(id: string) {
        this.readDB();
        return this.data.properties.find(p => p.id === id);
    }

    getProperties(landlordId: string) {
        this.readDB();
        return this.data.properties.filter(p => p.landlordId === landlordId);
    }

    getAllProperties() {
        this.readDB();
        return this.data.properties;
    }

    // TENANT STAY METHODS
    addTenantStay(stay: TenantStay) {
        this.readDB();
        this.data.tenantStays.push(stay);
        this.writeDB();
        return stay;
    }

    endTenantStay(tenantId: string) {
        this.readDB();
        const stay = this.data.tenantStays.find(s => s.tenantId === tenantId && s.status === 'ACTIVE');
        if (stay) {
            stay.status = 'MOVED_OUT';
            stay.moveOutDate = new Date().toISOString();
            this.writeDB();
            return stay;
        }
        return null;
    }

    getTenantStay(tenantId: string) {
        this.readDB();
        return this.data.tenantStays.find(s => s.tenantId === tenantId && s.status === 'ACTIVE');
    }

    getLandlordTenants(landlordId: string) {
        this.readDB();
        return this.data.tenantStays
            .filter(s => s.landlordId === landlordId && s.status === 'ACTIVE')
            .map(stay => {
                const tenant = this.data.users.find(u => u.id === stay.tenantId);
                const property = this.data.properties.find(p => p.id === stay.propertyId);
                return {
                    ...stay,
                    tenantName: tenant?.name || 'Unknown',
                    propertyName: property?.name || 'Unknown',
                    propertyAddress: property?.address
                };
            });
    }


    addProperty(property: Property) {
        this.readDB();
        this.data.properties.push(property);
        this.writeDB();
        return property;
    }

    deleteProperty(id: string) {
        this.readDB();
        this.data.properties = this.data.properties.filter(p => p.id !== id);
        this.writeDB();
    }

    updateProperty(id: string, updates: Partial<Property>) {
        this.readDB();
        const index = this.data.properties.findIndex(p => p.id === id);
        if (index !== -1) {
            this.data.properties[index] = { ...this.data.properties[index], ...updates };
            this.writeDB();
            return this.data.properties[index];
        }
        return null;
    }

    // BILL METHODS
    addBill(bill: Bill) {
        this.readDB();
        this.data.bills.push(bill);
        this.writeDB();
        return bill;
    }

    getBillsByLandlord(landlordId: string) {
        this.readDB();
        return this.data.bills.filter(b => b.landlordId === landlordId);
    }

    getBillsByTenant(tenantId: string) {
        this.readDB();
        return this.data.bills.filter(b => b.tenantId === tenantId);
    }

    payBill(billId: string) {
        this.readDB();
        const bill = this.data.bills.find(b => b.id === billId);
        if (bill) {
            bill.status = 'PAID';
            bill.paidAt = new Date().toISOString();
            this.writeDB();

            // Add history
            this.addHistory({
                id: Math.random().toString(36).substr(2, 9),
                tenantId: bill.tenantId,
                type: 'PAYMENT',
                date: new Date().toISOString(),
                description: `Paid ${bill.type} bill`,
                amount: bill.amount,
                createdBy: bill.tenantId
            });

            return bill;
        }
        return null;
    }

    deleteBill(billId: string) {
        this.readDB();
        const initialLength = this.data.bills.length;
        this.data.bills = this.data.bills.filter(b => b.id !== billId);
        if (this.data.bills.length !== initialLength) {
            this.writeDB();
            return true;
        }
        return false;
    }

    // DOCUMENT METHODS
    addDocument(doc: StoredDocument) {
        this.readDB();
        this.data.documents.push(doc);
        this.writeDB();
        return doc;
    }

    getDocumentsByLandlord(landlordId: string) {
        this.readDB();
        return this.data.documents.filter(d => d.landlordId === landlordId);
    }

    getDocumentsByTenant(tenantId: string) {
        this.readDB();
        return this.data.documents.filter(d => d.tenantId === tenantId);
    }

    // MESSAGE METHODS
    addMessage(message: Message) {
        this.readDB();
        this.data.messages.push(message);
        this.writeDB();
        return message;
    }

    getMessages(userId1: string, userId2: string) {
        this.readDB();
        return this.data.messages
            .filter(m => (m.senderId === userId1 && m.receiverId === userId2) || (m.senderId === userId2 && m.receiverId === userId1))
            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    }

    markMessagesAsRead(senderId: string, receiverId: string) {
        this.readDB();
        let changed = false;
        this.data.messages = this.data.messages.map(m => {
            if (m.senderId === senderId && m.receiverId === receiverId && !m.isRead) {
                changed = true;
                return { ...m, isRead: true };
            }
            return m;
        });

        if (changed) {
            this.writeDB();
        }
    }

    getUnreadCount(userId: string) {
        this.readDB();
        return this.data.messages.filter(m => m.receiverId === userId && !m.isRead).length;
    }

    getUnreadCountsBySender(userId: string) {
        this.readDB();
        const counts: Record<string, number> = {};
        this.data.messages.forEach(m => {
            if (m.receiverId === userId && !m.isRead) {
                counts[m.senderId] = (counts[m.senderId] || 0) + 1;
            }
        });
        return counts;
    }
}

export const db = new DBAdapter();
