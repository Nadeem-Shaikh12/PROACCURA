'use client';

import Link from 'next/link';
import { ArrowRight, ShieldCheck, UserCheck, Zap } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)]">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col justify-center items-center text-center px-4 py-20 bg-gradient-to-b from-white to-zinc-50 dark:from-zinc-950 dark:to-zinc-900">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-sm font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            Live Beta
          </div>
          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Rent with <span className="text-indigo-600">Confidence</span>.
          </h1>
          <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            The modern platform for seamless tenant verification and property management. Trust built into every lease.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Link
              href={user ? `/${user.role}/dashboard` : "/login"}
              className="inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-xl text-lg font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20"
            >
              Get Started <ArrowRight size={20} />
            </Link>
            <button className="inline-flex items-center justify-center gap-2 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 px-8 py-4 rounded-xl text-lg font-medium hover:bg-zinc-50 dark:hover:bg-zinc-750 transition-colors">
              View Demo
            </button>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-20 px-4 bg-white dark:bg-zinc-950 border-t border-zinc-100 dark:border-zinc-900">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<ShieldCheck className="h-8 w-8 text-emerald-500" />}
            title="Instant Verification"
            description="Automated identity and credit checks in seconds, not days."
          />
          <FeatureCard
            icon={<UserCheck className="h-8 w-8 text-blue-500" />}
            title="Role-Based Access"
            description="Dedicated portals for Landlords to manage and Tenants to apply."
          />
          <FeatureCard
            icon={<Zap className="h-8 w-8 text-amber-500" />}
            title="Seamless Workflow"
            description="From application to approval, handle everything digitally."
          />
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
      <div className="mb-4 p-3 bg-white dark:bg-zinc-800 rounded-xl w-fit shadow-sm">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2 text-zinc-900 dark:text-white">{title}</h3>
      <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">{description}</p>
    </div>
  );
}
