"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, User, Bell } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { CreditBadge } from './CreditBadge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

export function Header({ spinachBalance = 1500, starCandyBalance = 8420, userRole = 'user' }) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center gap-4 px-4">
        {/* Logo */}
        <Link 
          href="/"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#5b21b6] to-[#7c3aed]">
            <span className="text-xl">⭐</span>
          </div>
          <span className="text-xl font-semibold bg-gradient-to-r from-[#5b21b6] to-[#7c3aed] bg-clip-text text-transparent">
            StarP
          </span>
        </Link>

        {/* Search */}
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="글 검색..." 
              className="pl-10 bg-muted/50"
            />
          </div>
        </div>

        {/* Credit Balance - 클릭 시 /credits로 이동 */}
        <Link href="/credits" className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
          <CreditBadge type="spinach" amount={spinachBalance} />
          <CreditBadge type="starCandy" amount={starCandyBalance} />
        </Link>

        {/* Notifications */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full"
          onClick={() => router.push('/notifications')}
        >
          <Bell className="h-5 w-5" />
        </Button>

        {/* Profile Icon - 클릭 시 /mypage 이동 */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full"
          onClick={() => router.push('/mypage')}
        >
          <User className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}

