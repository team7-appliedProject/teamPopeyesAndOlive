'use client';

import { useEffect, useRef } from 'react';

interface ChartData {
  label: string;
  value: number;
}

interface BarChartProps {
  data: ChartData[];
  title: string;
  subtitle?: string;
  color?: string;
  height?: number;
}

interface LineChartProps {
  data: ChartData[];
  title: string;
  subtitle?: string;
  color?: string;
  height?: number;
}

export function BarChart({ data, title, subtitle, color = '#7c5cff', height = 260 }: BarChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const chartHeight = rect.height;
    const padding = { top: 10, right: 10, bottom: 40, left: 50 };
    const chartWidth = width - padding.left - padding.right;
    const chartAreaHeight = chartHeight - padding.top - padding.bottom;

    const maxValue = Math.max(...data.map(d => d.value)) * 1.1 || 1;

    ctx.clearRect(0, 0, width, chartHeight);

    // 그리드
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartAreaHeight / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();

      const value = maxValue - (maxValue / 4) * i;
      ctx.fillStyle = '#9ca3af';
      ctx.font = '10px system-ui';
      ctx.textAlign = 'right';
      ctx.fillText(formatNumber(value), padding.left - 8, y + 3);
    }

    // 바
    const barWidth = (chartWidth / data.length) * 0.6;
    const barGap = (chartWidth / data.length) * 0.4;

    data.forEach((item, index) => {
      const x = padding.left + (barWidth + barGap) * index + barGap / 2;
      const barHeight = (item.value / maxValue) * chartAreaHeight;
      const y = padding.top + chartAreaHeight - barHeight;

      ctx.fillStyle = color;
      roundRect(ctx, x, y, barWidth, barHeight, 3);

      ctx.fillStyle = '#9ca3af';
      ctx.font = '10px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(item.label, x + barWidth / 2, chartHeight - padding.bottom + 16);
    });
  }, [data, color]);

  if (data.length === 0) {
    return (
      <div className="card p-5">
        <div className="mb-3">
          <h3 className="text-sm font-bold text-gray-900">{title}</h3>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
        <div className="flex items-center justify-center text-gray-400 text-sm" style={{ height: `${height}px` }}>
          데이터가 없습니다
        </div>
      </div>
    );
  }

  return (
    <div className="card p-5">
      <div className="mb-3">
        <h3 className="text-sm font-bold text-gray-900">{title}</h3>
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
      </div>
      <canvas ref={canvasRef} style={{ width: '100%', height: `${height}px` }} />
    </div>
  );
}

export function LineChart({ data, title, subtitle, color = '#10b981', height = 260 }: LineChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const chartHeight = rect.height;
    const padding = { top: 10, right: 10, bottom: 40, left: 50 };
    const chartWidth = width - padding.left - padding.right;
    const chartAreaHeight = chartHeight - padding.top - padding.bottom;

    const maxValue = Math.max(...data.map(d => d.value)) * 1.2 || 1;

    ctx.clearRect(0, 0, width, chartHeight);

    // 그리드
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartAreaHeight / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();

      const value = maxValue - (maxValue / 4) * i;
      ctx.fillStyle = '#9ca3af';
      ctx.font = '10px system-ui';
      ctx.textAlign = 'right';
      ctx.fillText(formatNumber(value), padding.left - 8, y + 3);
    }

    // 영역
    const areaGradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartAreaHeight);
    areaGradient.addColorStop(0, `${color}20`);
    areaGradient.addColorStop(1, `${color}00`);

    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top + chartAreaHeight);
    data.forEach((item, index) => {
      const x = padding.left + (chartWidth / (data.length - 1 || 1)) * index;
      const y = padding.top + chartAreaHeight - (item.value / maxValue) * chartAreaHeight;
      ctx.lineTo(x, y);
    });
    ctx.lineTo(padding.left + chartWidth, padding.top + chartAreaHeight);
    ctx.closePath();
    ctx.fillStyle = areaGradient;
    ctx.fill();

    // 라인
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    data.forEach((item, index) => {
      const x = padding.left + (chartWidth / (data.length - 1 || 1)) * index;
      const y = padding.top + chartAreaHeight - (item.value / maxValue) * chartAreaHeight;
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // 포인트
    data.forEach((item, index) => {
      const x = padding.left + (chartWidth / (data.length - 1 || 1)) * index;
      const y = padding.top + chartAreaHeight - (item.value / maxValue) * chartAreaHeight;

      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#9ca3af';
      ctx.font = '10px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(item.label, x, chartHeight - padding.bottom + 16);
    });
  }, [data, color]);

  if (data.length === 0) {
    return (
      <div className="card p-5">
        <div className="mb-3">
          <h3 className="text-sm font-bold text-gray-900">{title}</h3>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
        <div className="flex items-center justify-center text-gray-400 text-sm" style={{ height: `${height}px` }}>
          데이터가 없습니다
        </div>
      </div>
    );
  }

  return (
    <div className="card p-5">
      <div className="mb-3">
        <h3 className="text-sm font-bold text-gray-900">{title}</h3>
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
      </div>
      <canvas ref={canvasRef} style={{ width: '100%', height: `${height}px` }} />
    </div>
  );
}

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(0) + 'K';
  return num.toFixed(0);
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x, y + h);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fill();
}
