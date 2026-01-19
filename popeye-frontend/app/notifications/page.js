"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Bell } from 'lucide-react';

// TODO: 실제 알림 데이터는 API에서 가져오기
const mockNotifications = [
  {
    id: '1',
    type: 'purchase',
    title: '글 구매 완료',
    message: 'Figma 고급 테크닉 30가지 글을 구매했습니다.',
    date: '2026-01-09 14:30',
    isRead: false,
  },
  {
    id: '2',
    type: 'credit',
    title: '크레딧 충전 완료',
    message: '10,000원으로 별사탕 100,000개를 충전했습니다.',
    date: '2026-01-08 10:15',
    isRead: false,
  },
  {
    id: '3',
    type: 'like',
    title: '좋아요 알림',
    message: '누군가 당신의 글에 좋아요를 눌렀습니다.',
    date: '2026-01-07 18:45',
    isRead: true,
  },
  {
    id: '4',
    type: 'comment',
    title: '댓글 알림',
    message: '새로운 댓글이 달렸습니다.',
    date: '2026-01-06 09:20',
    isRead: true,
  },
];

export default function NotificationsPage() {
  const unreadCount = mockNotifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Bell className="h-8 w-8 text-[#5b21b6]" />
              <h1 className="text-3xl font-bold">알림</h1>
              {unreadCount > 0 && (
                <Badge className="bg-[#5b21b6]">
                  {unreadCount}개의 읽지 않은 알림
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">TODO: 실제 알림 기능은 API 연동 필요</p>
          </div>

          {/* Notifications List */}
          <div className="space-y-4">
            {mockNotifications.map((notification) => (
              <Card 
                key={notification.id}
                className={!notification.isRead ? 'border-[#5b21b6] border-2' : ''}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {notification.title}
                        {!notification.isRead && (
                          <div className="h-2 w-2 rounded-full bg-[#5b21b6]"></div>
                        )}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {notification.message}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="ml-4">
                      {notification.type === 'purchase' && '구매'}
                      {notification.type === 'credit' && '크레딧'}
                      {notification.type === 'like' && '좋아요'}
                      {notification.type === 'comment' && '댓글'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {notification.date}
                    </span>
                    {!notification.isRead && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          // TODO: 알림 읽음 처리
                          alert('TODO: 알림 읽음 처리 API 호출');
                        }}
                      >
                        읽음 처리
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {mockNotifications.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">알림이 없습니다.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

