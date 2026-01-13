import { db } from './db';
import { MOCK_LEASES, MOCK_SCHEDULES } from '@/lib/store';

export async function checkAndTriggerMonthlyNotifications(userId: string, role: 'landlord' | 'tenant') {
    // Existing Monthly Milestone Logic
    if (role === 'tenant') {
        const request = await db.findRequestByTenantId(userId);
        if (request && request.status === 'approved' && request.joiningDate) {
            await processMonthlyLogic(request.tenantId, request.joiningDate, 'tenant', request.fullName);
        }
    } else {
        const allRequests = await db.getRequests();
        const requests = allRequests.filter(r => r.landlordId === userId && r.status === 'approved');
        for (const req of requests) {
            await processMonthlyLogic(req.tenantId, req.joiningDate!, 'landlord', req.fullName, userId);
        }
    }

    // New Alert Logic
    await checkAlerts(userId, role);
}

async function checkAlerts(userId: string, role: 'landlord' | 'tenant') {
    // 1. Check Lease Expiry
    const leases = role === 'landlord'
        ? MOCK_LEASES.filter(l => l.landlordId === userId)
        : MOCK_LEASES.filter(l => l.tenantId === userId);

    for (const lease of leases) {
        if (lease.status !== 'ACTIVE') continue;
        const expiryDate = new Date(lease.endDate);
        const today = new Date();
        const diffTime = expiryDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 30 && diffDays > 0) {
            const title = 'Lease Expiring Soon';
            const message = `The lease for ${lease.propertyName} expires in ${diffDays} days.`;
            await triggerNotification(userId, role, 'LEASE_EXPIRY', title, message);
        }
    }

    // 2. Check Rent Dues (Tenant mainly)
    if (role === 'tenant') {
        const schedules = MOCK_SCHEDULES.filter(s => s.tenantId === userId && s.isActive);
        for (const sched of schedules) {
            const dueDate = new Date(sched.nextDueDate);
            const today = new Date();
            const diffTime = dueDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays <= 3 && diffDays >= 0) {
                const title = 'Rent Due Soon';
                const message = `Rent of ₹${sched.amount} is due in ${diffDays === 0 ? 'today' : diffDays + ' days'}. Payment is required.`;
                await triggerNotification(userId, role, 'PAYMENT_PENDING', title, message);
            }
        }
    }
}

async function triggerNotification(userId: string, role: string, type: string, title: string, message: string) {
    const existingNotifications = await db.getNotifications(userId);
    // Avoid spamming the same notification repeatedly (basic check)
    const alreadyExists = existingNotifications.find(n => n.title === title && n.message === message && !n.isRead);

    if (!alreadyExists) {
        await db.addNotification({
            id: crypto.randomUUID(),
            userId,
            role: role as any,
            title,
            message,
            type: type as any,
            isRead: false,
            createdAt: new Date().toISOString()
        });
    }
}

async function processMonthlyLogic(tenantId: string, joiningDateStr: string, role: 'landlord' | 'tenant', tenantName: string, landlordId?: string) {
    const joiningDate = new Date(joiningDateStr);
    const today = new Date();

    // Calculate months difference
    const monthsDiff = (today.getFullYear() - joiningDate.getFullYear()) * 12 + (today.getMonth() - joiningDate.getMonth());

    // Day of the month check
    // If today's day is >= joining day, it means a new month cycle has started
    if (monthsDiff > 0 && today.getDate() >= joiningDate.getDate()) {
        const cycleNumber = monthsDiff;
        const notificationType = 'MONTH_COMPLETED';

        // Check if this specific notification already exists
        const existingNotifications = await db.getNotifications(role === 'landlord' ? landlordId! : tenantId);
        const alreadyNotified = existingNotifications.find(n => n.type === 'MONTH_COMPLETED' && n.message.includes(`month ${cycleNumber}`));

        if (!alreadyNotified) {
            const title = role === 'landlord' ? 'Tenant Milestone' : 'Stay Milestone';
            const message = role === 'landlord'
                ? `Tenant ${tenantName} has completed month ${cycleNumber} of their stay.`
                : `Congratulations! You have completed month ${cycleNumber} of your stay.`;

            await db.addNotification({
                id: crypto.randomUUID(),
                userId: role === 'landlord' ? landlordId! : tenantId,
                role: role,
                title,
                message,
                type: 'MONTH_COMPLETED',
                isRead: false,
                createdAt: new Date().toISOString()
            });

            // Also trigger "New Billing Cycle" notification
            await db.addNotification({
                id: crypto.randomUUID(),
                userId: role === 'landlord' ? landlordId! : tenantId,
                role: role,
                title: 'New Billing Cycle',
                message: role === 'landlord'
                    ? `A new billing cycle has started for ${tenantName}.`
                    : `Your new monthly billing cycle has started.`,
                type: 'NEW_BILL_CYCLE',
                isRead: false,
                createdAt: new Date().toISOString()
            });
        }
    }
}
