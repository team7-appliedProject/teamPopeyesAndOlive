'use client';

import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number | null;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  } | null;
  color?: 'purple' | 'green' | 'pink' | 'orange' | 'blue';
  delay?: number;
}

export default function StatCard({
  title,
  value,
  icon,
  trend,
}: StatCardProps) {
  return (
    <div className="card p-5">
      <p className="text-gray-500 text-sm mb-3">{title}</p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center">
              {icon}
            </div>
          )}
          <p className="text-2xl font-bold text-gray-900">
            {value != null ? (typeof value === 'number' ? value.toLocaleString() : value) : '-'}
          </p>
        </div>
        {trend && (
          <div className={`flex items-center gap-1 ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`}>
            <svg className={`w-3 h-3 ${trend.isPositive ? '' : 'rotate-180'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            <span className="text-xs font-semibold">{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>
    </div>
  );
}
