'use client';

import Link from 'next/link';
import { ReactNode } from 'react';

interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T) => ReactNode;
  width?: string;
}

interface DataTableProps<T> {
  title: string;
  subtitle?: string;
  columns: Column<T>[];
  data: T[];
  detailLink?: string;
  detailLinkText?: string;
  emptyMessage?: string;
  icon?: ReactNode;
  accentColor?: 'purple' | 'green' | 'pink' | 'orange';
}

export default function DataTable<T extends Record<string, unknown>>({
  title,
  subtitle,
  columns,
  data,
  detailLink,
  detailLinkText = '자세히 보기',
  emptyMessage = '데이터가 없습니다.',
  icon,
}: DataTableProps<T>) {
  return (
    <div className="card">
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon && (
              <div className="w-7 h-7 rounded bg-pink-100 text-pink-500 flex items-center justify-center">
                {icon}
              </div>
            )}
            <div>
              <h3 className="text-sm font-bold text-gray-900">{title}</h3>
              {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
            </div>
          </div>
          {detailLink && (
            <Link href={detailLink} className="text-xs text-gray-400 hover:text-purple-500">
              {detailLinkText} →
            </Link>
          )}
        </div>
      </div>

      <table className="w-full">
        <thead>
          <tr className="bg-gray-50">
            {columns.map((column) => (
              <th
                key={String(column.key)}
                className="px-4 py-2.5 text-left text-xs font-medium text-gray-500"
                style={{ width: column.width }}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((item, index) => (
              <tr key={index} className="border-b border-gray-50 hover:bg-gray-50">
                {columns.map((column) => (
                  <td key={String(column.key)} className="px-4 py-2.5 text-sm text-gray-600">
                    {column.render
                      ? column.render(item)
                      : String(item[column.key as keyof T] ?? '-')}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-sm text-gray-500">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
