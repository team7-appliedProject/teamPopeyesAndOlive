'use client';

import Link from 'next/link';

interface HeaderStats {
  spinach: number | null;
  starcandy: number | null;
}

interface AdminHeaderProps {
  stats?: HeaderStats;
}

export default function AdminHeader({ stats }: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-[1400px] mx-auto px-8 h-14 flex items-center justify-between">
        {/* 로고 영역 */}
        <Link href="/admin" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
            <span className="text-white text-lg">⭐</span>
          </div>
          <span className="text-lg font-bold text-gray-900">StarP</span>
        </Link>

        {/* 검색 바 */}
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="글 검색..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-purple-500 focus:bg-white"
            />
          </div>
        </div>

        {/* 오른쪽 메뉴 */}
        <div className="flex items-center gap-3">
          {/* 시금치 잔액 */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-full border border-green-200">
            <span className="text-base">🥬</span>
            <span className="text-sm font-semibold text-green-600">
              {stats?.spinach != null ? stats.spinach.toLocaleString() : '-'}
            </span>
          </div>

          {/* 별사탕 잔액 */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 rounded-full">
            <span className="text-base">⭐</span>
            <span className="text-sm font-semibold text-white">
              {stats?.starcandy != null ? stats.starcandy.toLocaleString() : '-'}
            </span>
          </div>

          {/* 알림 */}
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>

          {/* 프로필 */}
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
