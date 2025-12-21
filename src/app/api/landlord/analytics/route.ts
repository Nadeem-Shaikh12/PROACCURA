import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const landlordId = searchParams.get('landlordId');

    if (!landlordId) {
        return NextResponse.json({ error: 'Missing landlordId' }, { status: 400 });
    }

    try {
        const properties = db.getProperties(landlordId);
        const bills = db.getBillsByLandlord(landlordId);
        const tenants = db.getLandlordTenants(landlordId);

        // 1. Occupancy Stats
        let totalUnits = 0;
        let occupiedUnits = 0;

        properties.forEach(p => {
            totalUnits += p.units;
            occupiedUnits += p.occupiedUnits;
        });

        const vacantUnits = totalUnits - occupiedUnits;
        const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;

        // 2. Revenue Trends (Last 6 Months)
        const revenueTrends = [];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentMonth = new Date().getMonth();

        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(currentMonth - i);
            const monthName = months[date.getMonth()];
            const year = date.getFullYear();
            const monthStr = `${monthName} ${year}`; // e.g. "Dec 2025" - simplified matching

            // Calculate collected based on paidAt date (mock logic approximation)
            // Ideally we check bill.paidAt
            const monthlyBills = bills.filter(b => {
                if (!b.paidAt) return false;
                const paidDate = new Date(b.paidAt);
                return paidDate.getMonth() === date.getMonth() && paidDate.getFullYear() === year;
            });

            const revenue = monthlyBills.reduce((sum, b) => sum + b.amount, 0);

            // Calculate pending (bills due in this month that are not paid)
            const dueBills = bills.filter(b => {
                const dueDate = new Date(b.dueDate);
                return dueDate.getMonth() === date.getMonth() && dueDate.getFullYear() === year && b.status !== 'PAID';
            });
            const pending = dueBills.reduce((sum, b) => sum + b.amount, 0);

            revenueTrends.push({
                name: monthName,
                revenue,
                pending
            });
        }

        // 3. Payment Status Breakdown
        const paymentStats = [
            { name: 'Paid On Time', value: bills.filter(b => b.status === 'PAID').length, color: '#10B981' }, // Emerald
            { name: 'Pending', value: bills.filter(b => b.status === 'PENDING').length, color: '#F59E0B' }, // Amber
            { name: 'Overdue', value: bills.filter(b => b.status === 'OVERDUE').length, color: '#EF4444' }, // Red
        ];


        // 4. Property Performance (Top 5 by Revenue) 
        // Mocking revenue per property since bills link to tenant -> property logic needed
        // Assuming simple link via tenantStay

        return NextResponse.json({
            occupancy: { total: totalUnits, occupied: occupiedUnits, vacant: vacantUnits, rate: Math.round(occupancyRate) },
            revenueTrends,
            paymentStats
        });

    } catch (error) {
        console.error('Analytics Error:', error);
        return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
    }
}
