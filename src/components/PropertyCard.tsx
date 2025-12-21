'use client';

import { Property } from '@/lib/store';
import { MapPin, CheckCircle2, DollarSign } from 'lucide-react';
import Image from 'next/image';

interface PropertyCardProps {
    property: Property;
    onApply?: (id: string) => void;
    isLandlordView?: boolean;
}

export default function PropertyCard({ property, onApply, isLandlordView = false }: PropertyCardProps) {
    return (
        <div className="group bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 hover:shadow-xl transition-all duration-300">
            <div className="relative aspect-video w-full overflow-hidden bg-zinc-100">
                <Image
                    src={property.imageUrl}
                    alt={property.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {property.verified && (
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-semibold text-emerald-600 flex items-center gap-1 shadow-sm">
                        <CheckCircle2 size={12} />
                        Verified
                    </div>
                )}
            </div>

            <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-zinc-900 dark:text-white line-clamp-1">{property.title}</h3>
                    <p className="flex items-center text-indigo-600 font-bold">
                        <DollarSign size={16} className="mr-0.5" />
                        {property.price.toLocaleString()}
                        <span className="text-zinc-500 text-sm font-normal ml-1">/mo</span>
                    </p>
                </div>

                <div className="flex items-center gap-1 text-zinc-500 text-sm mb-4">
                    <MapPin size={14} />
                    <span className="truncate">{property.location}</span>
                </div>

                <p className="text-zinc-600 dark:text-zinc-400 text-sm line-clamp-2 mb-4">
                    {property.description}
                </p>

                {!isLandlordView && (
                    <button
                        onClick={() => onApply?.(property.id)}
                        className="w-full py-2.5 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 rounded-xl font-medium text-sm hover:opacity-90 transition-opacity"
                    >
                        Apply Now
                    </button>
                )}

                {isLandlordView && (
                    <div className="w-full py-2.5 text-center text-sm font-medium text-zinc-500 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
                        Manage Property
                    </div>
                )}
            </div>
        </div>
    );
}
