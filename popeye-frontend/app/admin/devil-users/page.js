"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Shield, Users, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { adminApi } from '@/app/lib/api';

export default function DevilUsersPage() {
  const [devilUsers, setDevilUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 밴 모달 상태
  const [banModalOpen, setBanModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [banReason, setBanReason] = useState('');
  const [banDays, setBanDays] = useState('');
  const [isPermanent, setIsPermanent] = useState(false);
  const [banLoading, setBanLoading] = useState(false);

  const fetchDevilUsers = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getDevilUsers(0).catch(() => []);
      setDevilUsers(data);
    } catch (err) {
      setError(err.message || '데이터를 불러오는데 실패했습니다.');
      console.error('Devil users fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevilUsers();
  }, []);

  // 밴 처리 버튼 클릭
  const handleBanClick = (user) => {
    setSelectedUser(user);
    setBanReason('');
    setBanDays('');
    setIsPermanent(false);
    setBanModalOpen(true);
  };

  // 밴 처리 실행
  const handleBanSubmit = async () => {
    if (!selectedUser) return;
    if (!banReason.trim()) {
      alert('사유를 입력해주세요.');
      return;
    }
    if (!isPermanent && !banDays) {
      alert('밴 기간을 입력하거나 영구 밴을 선택해주세요.');
      return;
    }

    try {
      setBanLoading(true);
      
      const banData = {
        banUserId: selectedUser.userId,  // 백엔드 필드명: banUserId
        reason: banReason.trim(),
        banDays: isPermanent ? null : (banDays ? parseInt(banDays, 10) : null),
      };

      await adminApi.banUser(banData);
      
      alert(`${selectedUser.nickname || selectedUser.userId}님이 밴 처리되었습니다.`);
      setBanModalOpen(false);
      
      // 목록 새로고침
      fetchDevilUsers();
    } catch (err) {
      console.error('Ban user error:', err);
      alert(err.message || '밴 처리 중 오류가 발생했습니다.');
    } finally {
      setBanLoading(false);
    }
  };

  // 신고 횟수에 따른 배지 색상
  const getDevilCountBadge = (count) => {
    if (count >= 10) {
      return <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">{count}회</span>;
    } else if (count >= 5) {
      return <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">{count}회</span>;
    } else if (count >= 1) {
      return <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">{count}회</span>;
    }
    return <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{count}회</span>;
  };

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
                  className="text-sm font-medium text-primary border-b-2 border-primary pb-1"
                >
                  유저 관리
                </Link>
                <Link 
                  href="/admin/users" 
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
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
            <h2 className="text-2xl font-bold">유저 관리</h2>
            <p className="text-muted-foreground mt-1">플랫폼 활동에서 문제가 있는 유저 정보를 관리합니다.</p>
          </div>

          {/* Devil Users Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                악성 유저 목록
              </CardTitle>
              <CardDescription>
                신고 이력이 있는 유저 목록입니다. 필요한 경우 밴 처리를 진행하세요.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>유저 ID</TableHead>
                    <TableHead>닉네임</TableHead>
                    <TableHead>이메일</TableHead>
                    <TableHead>신고 횟수</TableHead>
                    <TableHead>총 밴 일수</TableHead>
                    <TableHead className="text-right">작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {devilUsers.length > 0 ? (
                    devilUsers.map((user) => (
                      <TableRow key={user.userId}>
                        <TableCell className="font-medium">{user.userId}</TableCell>
                        <TableCell>{user.nickname || '-'}</TableCell>
                        <TableCell>{user.email || '-'}</TableCell>
                        <TableCell>{getDevilCountBadge(user.devilCount || 0)}</TableCell>
                        <TableCell>
                          {user.blockedDays ? (
                            <span className="text-red-600 font-medium">{user.blockedDays}일</span>
                          ) : (
                            <span className="text-gray-400">0일</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleBanClick(user)}
                          >
                            밴 처리
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                        악성 유저가 없습니다.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 밴 처리 모달 */}
      <Dialog open={banModalOpen} onOpenChange={setBanModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>유저 밴 처리</DialogTitle>
            <DialogDescription>
              {selectedUser && (
                <>
                  <span className="font-semibold text-foreground">{selectedUser.nickname || `유저 #${selectedUser.userId}`}</span>
                  님을 밴 처리합니다.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {/* 사유 입력 */}
            <div className="grid gap-2">
              <Label htmlFor="reason">밴 사유 *</Label>
              <Textarea
                id="reason"
                placeholder="밴 사유를 입력하세요..."
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            {/* 밴 기간 입력 */}
            <div className="grid gap-2">
              <Label htmlFor="banDays">밴 기간 (일)</Label>
              <div className="flex items-center gap-3">
                <Input
                  id="banDays"
                  type="number"
                  placeholder="예: 7"
                  value={banDays}
                  onChange={(e) => setBanDays(e.target.value)}
                  disabled={isPermanent}
                  min="1"
                  className="flex-1"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="permanent"
                    checked={isPermanent}
                    onChange={(e) => {
                      setIsPermanent(e.target.checked);
                      if (e.target.checked) setBanDays('');
                    }}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="permanent" className="text-sm font-normal cursor-pointer">
                    영구 밴
                  </Label>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBanModalOpen(false)}
              disabled={banLoading}
            >
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={handleBanSubmit}
              disabled={banLoading}
            >
              {banLoading ? '처리 중...' : '밴 처리'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
