import { TenantHistory } from './db';

export function calculateTrustScore(history: TenantHistory[]): number {
    let score = 70; // Start with a base score

    if (!history || history.length === 0) return score;

    // 1. Consistency Bonus (Length of stay/history)
    // Cap at 10 points for > 5 events
    score += Math.min(history.length * 2, 10);

    // 2. Payment Analysis
    const payments = history.filter(h => h.type === 'RENT_PAYMENT' || h.type === 'PAYMENT');
    const latePayments = payments.filter(p => p.description.toLowerCase().includes('late') || p.description.toLowerCase().includes('overdue'));

    // Add points for each on-time payment (max 15)
    score += Math.min((payments.length - latePayments.length) * 3, 15);

    // Deduct heavily for late payments
    score -= latePayments.length * 5;

    // 3. Remarks Analysis
    const negativeRemarks = history.filter(h => h.type === 'REMARK' && (h.description.toLowerCase().includes('warning') || h.description.toLowerCase().includes('complaint')));
    const positiveRemarks = history.filter(h => h.type === 'REMARK' && (h.description.toLowerCase().includes('appreciate') || h.description.toLowerCase().includes('good')));

    score -= negativeRemarks.length * 10; // Big penalty for complaints
    score += positiveRemarks.length * 5;  // Bonus for praise

    // 4. Verification Bonus
    const joined = history.find(h => h.type === 'JOINED');
    if (joined) score += 5;

    // Clamp score between 0 and 100
    return Math.max(0, Math.min(100, score));
}

export function getTrustBadgeColor(score: number): string {
    if (score >= 90) return 'text-emerald-600 bg-emerald-50 border-emerald-100';
    if (score >= 70) return 'text-blue-600 bg-blue-50 border-blue-100';
    if (score >= 50) return 'text-amber-600 bg-amber-50 border-amber-100';
    return 'text-rose-600 bg-rose-50 border-rose-100';
}
