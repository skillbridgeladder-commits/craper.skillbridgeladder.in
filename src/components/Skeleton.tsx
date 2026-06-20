'use client'

export default function Skeleton({ className = '', ...props }: { className?: string;[key: string]: any }) {
    return (
        <div
            className={`rounded-xl overflow-hidden ${className}`}
            style={{
                background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.8s ease-in-out infinite',
            }}
            {...props}
        />
    )
}

export function CardSkeleton() {
    return (
        <div className="glass !p-6">
            <Skeleton className="w-12 h-12 rounded-xl mb-4" />
            <Skeleton className="w-3/4 h-5 mb-3" />
            <Skeleton className="w-full h-3 mb-2" />
            <Skeleton className="w-2/3 h-3" />
        </div>
    )
}

export function StatSkeleton() {
    return (
        <div className="glass !p-5">
            <Skeleton className="w-8 h-8 rounded-lg mb-3" />
            <Skeleton className="w-16 h-8 mb-2" />
            <Skeleton className="w-20 h-3" />
        </div>
    )
}

export function TableRowSkeleton() {
    return (
        <div className="glass !p-5 flex items-center gap-4">
            <Skeleton className="w-16 h-16 rounded-lg shrink-0" />
            <div className="flex-1">
                <Skeleton className="w-32 h-4 mb-2" />
                <Skeleton className="w-48 h-3 mb-1" />
                <Skeleton className="w-24 h-3" />
            </div>
            <div className="flex gap-2">
                <Skeleton className="w-20 h-8 rounded-full" />
                <Skeleton className="w-20 h-8 rounded-full" />
            </div>
        </div>
    )
}
