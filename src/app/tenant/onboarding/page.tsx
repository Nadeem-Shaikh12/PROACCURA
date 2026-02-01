'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Search, CreditCard, ChevronRight, CheckCircle, Loader2, MapPin, Building, Upload } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function OnboardingPage() {
    const router = useRouter();
    const { user, refreshUser, isLoading } = useAuth();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Step 1: Profile State
    const [profile, setProfile] = useState({
        mobile: '',
        city: '',
        state: '',
        aadhaarNumber: ''
    });

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
            return;
        }

        if (user) {
            // Check if already has pending request or active stay
            const checkStatus = async () => {
                const [reqRes, stayRes] = await Promise.all([
                    fetch('/api/tenant/verify'),
                    fetch('/api/tenant/stay')
                ]);
                const reqData = await reqRes.json();
                const stayData = await stayRes.json();

                if (stayData.stay) {
                    router.replace('/tenant/dashboard');
                    return;
                }

                if (reqData.request && reqData.request.status === 'pending') {
                    // Redirect to dashboard where pending screen is shown
                    router.replace('/tenant/dashboard');
                }
            };
            checkStatus();
        }
    }, [user, isLoading, router]);

    // Step 2: Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [properties, setProperties] = useState<any[]>([]);
    const [selectedProperty, setSelectedProperty] = useState<any>(null);

    // Step 1 Handler
    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/auth/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profile)
            });
            if (res.ok) {
                setStep(2);
                fetchProperties(); // Pre-fetch properties
            }
        } finally {
            setLoading(false);
        }
    };

    // Step 2 Handler
    const fetchProperties = async () => {
        const res = await fetch(`/api/properties/search?q=${searchQuery}`);
        const data = await res.json();
        setProperties(data.properties || []);
    };

    useEffect(() => {
        if (step === 2) {
            const delayDebounceFn = setTimeout(() => {
                fetchProperties();
            }, 500);
            return () => clearTimeout(delayDebounceFn);
        }
    }, [searchQuery, step]);

    // Step 3 Handler (Payment & Request)
    const handlePayment = async () => {
        setLoading(true);
        try {
            // 1. First "Process Payment" (Mock)
            // In real world, call Stripe/Razorpay here.
            await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate delay

            // 2. Submit Verification Request
            const res = await fetch('/api/tenant/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    propertyId: selectedProperty.id,
                    fullName: user?.name, // From Auth
                    mobile: profile.mobile,
                    city: profile.city,
                    idProofType: 'Aadhaar',
                    idProofNumber: profile.aadhaarNumber,
                    paymentStatus: 'paid',
                    paymentAmount: 116.82,
                    transactionId: 'TXN_' + Math.random().toString(36).substr(2, 9).toUpperCase()
                })
            });

            if (res.ok) {
                // Redirect to Dashboard
                router.push('/tenant/dashboard');
            } else {
                let errorMsg = 'Verification request failed. Please try again.';
                try {
                    const data = await res.json();
                    if (data.error) errorMsg = data.error;
                    if (data.details) console.error('Error details:', data.details);
                } catch (e) {
                    console.error('Error parsing response:', e);
                }
                alert(errorMsg);
            }
        } catch (e) {
            console.error(e);
            alert('Something went wrong.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-4">
            <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl border border-zinc-100 overflow-hidden">
                {/* Header */}
                <div className="p-6 sm:p-8 bg-zinc-900 text-white">
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight">Setup Your Account</h1>
                    <p className="text-zinc-400 mt-2 text-sm">Complete these steps to access your rental dashboard.</p>

                    {/* Progress Bar */}
                    <div className="flex items-center gap-2 mt-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-500 ${step >= i ? 'bg-indigo-500' : 'bg-zinc-700'}`}></div>
                        ))}
                    </div>
                </div>

                <div className="p-6 sm:p-8">
                    {/* STEP 1: PERSONAL DETAILS */}
                    {step === 1 && (
                        <form onSubmit={handleProfileSubmit} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-black">1</div>
                                Personal Details
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">Mobile Number</label>
                                    <input
                                        required
                                        value={profile.mobile}
                                        onChange={e => setProfile({ ...profile, mobile: e.target.value })}
                                        className="w-full p-4 bg-zinc-50 rounded-xl font-bold border-transparent focus:bg-white focus:border-indigo-500 transition outline-none"
                                        placeholder="Enter your mobile number"
                                    />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">City</label>
                                        <input
                                            required
                                            value={profile.city}
                                            onChange={e => setProfile({ ...profile, city: e.target.value })}
                                            className="w-full p-4 bg-zinc-50 rounded-xl font-bold border-transparent focus:bg-white focus:border-indigo-500 transition outline-none"
                                            placeholder="City"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">State</label>
                                        <input
                                            required
                                            value={profile.state}
                                            onChange={e => setProfile({ ...profile, state: e.target.value })}
                                            className="w-full p-4 bg-zinc-50 rounded-xl font-bold border-transparent focus:bg-white focus:border-indigo-500 transition outline-none"
                                            placeholder="State"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">Aadhaar Number</label>
                                        <input
                                            required
                                            value={profile.aadhaarNumber}
                                            onChange={e => setProfile({ ...profile, aadhaarNumber: e.target.value })}
                                            className="w-full p-4 bg-zinc-50 rounded-xl font-bold border-transparent focus:bg-white focus:border-indigo-500 transition outline-none"
                                            placeholder="XXXX XXXX XXXX"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">ID Proof Upload</label>
                                        <div className="relative w-full">
                                            <input
                                                type="file"
                                                accept="image/*,.pdf"
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            />
                                            <div className="w-full p-4 bg-zinc-50 rounded-xl font-bold border-2 border-dashed border-zinc-200 text-zinc-400 text-sm flex items-center justify-center gap-2 hover:bg-white hover:border-indigo-500 hover:text-indigo-500 transition text-center px-2">
                                                <Upload size={16} /> <span>Upload Document</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button disabled={loading} className="w-full py-4 bg-zinc-900 text-white rounded-xl font-bold hover:bg-black transition flex items-center justify-center gap-2">
                                {loading && <Loader2 className="animate-spin" size={18} />}
                                Next Step <ChevronRight size={18} />
                            </button>
                        </form>
                    )}

                    {/* STEP 2: SELECT LANDLORD */}
                    {step === 2 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-black">2</div>
                                Find Your Property
                            </h2>

                            <div className="relative">
                                <Search className="absolute left-4 top-4 text-zinc-400" size={20} />
                                <input
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 p-4 bg-zinc-50 rounded-xl font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500 transition outline-none"
                                    placeholder="Search by Property Name, City..."
                                />
                            </div>

                            <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                {properties.map(p => (
                                    <div
                                        key={p.id}
                                        onClick={() => setSelectedProperty(p)}
                                        className={`p-4 rounded-xl border cursor-pointer transition flex items-center justify-between ${selectedProperty?.id === p.id ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500' : 'border-zinc-100 hover:border-zinc-300'}`}
                                    >
                                        <div>
                                            <div className="font-bold text-zinc-900">{p.name}</div>
                                            <div className="text-xs text-zinc-500 font-medium">{p.landlordName}</div>
                                            <div className="text-xs text-zinc-400 flex items-center gap-1 mt-1">
                                                <MapPin size={10} /> {p.address} | <Building size={10} /> {p.type}
                                            </div>
                                        </div>
                                        {selectedProperty?.id === p.id && <CheckCircle className="text-indigo-600" size={20} />}
                                    </div>
                                ))}
                            </div>

                            <button
                                disabled={!selectedProperty}
                                onClick={() => setStep(3)}
                                className="w-full py-4 bg-zinc-900 text-white rounded-xl font-bold hover:bg-black transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Continue <ChevronRight size={18} />
                            </button>
                        </div>
                    )}

                    {/* STEP 3: PAYMENT */}
                    {step === 3 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-black">3</div>
                                Verification Payment
                            </h2>

                            <div className="p-6 bg-zinc-50 rounded-2xl border border-zinc-100">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="font-medium text-zinc-600">Verification Fee</span>
                                    <span className="font-bold text-lg">₹99.00</span>
                                </div>
                                <div className="flex justify-between items-center mb-6">
                                    <span className="font-medium text-zinc-600">GST (18%)</span>
                                    <span className="font-bold text-lg">₹17.82</span>
                                </div>
                                <div className="border-t border-zinc-200 pt-4 flex justify-between items-center">
                                    <span className="font-black text-xl">Total</span>
                                    <span className="font-black text-3xl text-indigo-600">₹116.82</span>
                                </div>
                            </div>

                            <button
                                onClick={handlePayment}
                                disabled={loading}
                                className="w-full py-4 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : <CreditCard size={20} />}
                                Pay & Submit Request
                            </button>
                            <p className="text-center text-xs text-zinc-400">Secure Payment via MockGateway</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
