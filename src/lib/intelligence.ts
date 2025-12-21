import { TenantHistory } from './db';

export function calculateTrustScore(history: TenantHistory[]): number {
    let score = 85; // Base score starts at "Good"

    history.forEach(record => {
        if (record.type === 'RENT_PAYMENT') {
            score += 2; // Positive for paying rent
        }
        if (record.type === 'REMARK') {
            if (record.description.toLowerCase().includes('late') || record.description.toLowerCase().includes('issue')) {
                score -= 5;
            } else {
                score += 1;
            }
        }
        if (record.type === 'LIGHT_BILL') {
            score += 1;
        }
    });

    return Math.min(100, Math.max(0, score));
}

export function calculateStayDuration(joiningDate?: string): string {
    if (!joiningDate) return 'N/A';

    const start = new Date(joiningDate);
    const end = new Date();

    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());

    if (months < 1 || isNaN(months)) return 'New Joiner';
    if (months < 12) return `${months} Months`;

    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;

    return remainingMonths > 0 ? `${years}y ${remainingMonths}m` : `${years} Years`;
}

export function detectSystemAlerts(tenants: any[], notifications: any[]): any[] {
    const freshAlerts: any[] = [];
    const today = new Date();
    const isFirstOfMonth = today.getDate() === 1;

    // 1. Check for New Billing Cycle (1st of Month)
    if (isFirstOfMonth) {
        const cycleAlertKey = `billing-cycle-${today.getMonth()}-${today.getFullYear()}`;
        if (!notifications.some(n => n.id.includes(cycleAlertKey))) {
            freshAlerts.push({
                id: cycleAlertKey,
                title: "New Billing Cycle",
                message: `The billing cycle for ${today.toLocaleString('default', { month: 'long' })} has started.`,
                type: 'NEW_BILL_CYCLE'
            });
        }
    }

    // 2. Check for Tenant Anniversaries
    tenants.forEach(tenant => {
        if (tenant.joiningDate) {
            const joinDate = new Date(tenant.joiningDate);
            if (joinDate.getDate() === today.getDate() && joinDate.getMonth() === today.getMonth()) {
                const anniversaryKey = `anniversary-${tenant.id}-${today.getFullYear()}`;
                if (!notifications.some(n => n.id.includes(anniversaryKey))) {
                    freshAlerts.push({
                        id: anniversaryKey,
                        title: "Tenant Anniversary",
                        message: `${tenant.fullName} has completed another year at your property!`,
                        type: 'REMARK_ADDED'
                    });
                }
            }
        }
    });

    return freshAlerts;
}
