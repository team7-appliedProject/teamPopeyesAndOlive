"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Shield, Ban } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { userApi } from '@/app/lib/api';

export default function BannedUsersPage() {
  const [bannedUsers, setBannedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await userApi.getBannedUsers(0, 20).catch(() => []);
        setBannedUsers(data);
      } catch (err) {
        setError(err.message || '데이터를 불러오는데 실패했습니다.');
        console.error('Banned users fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div className="flex items-center gap-6">
              <h1 className="text-3xl font-bold">관리자 페이지</h1>
              <nav className="flex items-center gap-4">
                <Link 
                  href="/admin" 
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  대시보드
                </Link>
                <Link 
                  href="/admin/reports" 
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  신고 관리
                </Link>
                <Link 
                  href="/admin/devil-users" 
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  유저 관리
                </Link>
                <Link 
                  href="/admin/users" 
                  className="text-sm font-medium text-primary border-b-2 border-primary pb-1"
                >
                  밴 유저 관리
                </Link>
                <Link 
                  href="/admin/bans" 
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  밴 게시글 관리
                </Link>
              </nav>
            </div>
          </div>

          {/* Page Title */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold">밴 유저 관리</h2>
            <p className="text-muted-foreground mt-1">제재된 유저 목록을 관리합니다.</p>
          </div>

          {/* Banned Users Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ban className="h-5 w-5 text-destructive" />
                밴 유저 목록
              </CardTitle>
              <CardDescription>
                현재 제재 중인 유저 목록입니다. 밴 해제가 필요한 경우 해제 버튼을 클릭하세요.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>유저 ID</TableHead>
                    <TableHead>밴 시작일</TableHead>
                    <TableHead>밴 해제일</TableHead>
                    <TableHead>밴 기간</TableHead>
                    <TableHead>사유</TableHead>
                    <TableHead className="text-right">작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bannedUsers.length > 0 ? (
                    bannedUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.id}</TableCell>
                        <TableCell>{user.bannedAt || '-'}</TableCell>
                        <TableCell>
                          {user.unbannedAt ? (
                            user.unbannedAt
                          ) : (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              영구
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {user.banDays ? (
                            `${user.banDays}일`
                          ) : (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              영구
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="max-w-[250px] truncate">{user.reason || '-'}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm">
                            밴 해제
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                        밴된 유저가 없습니다.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
