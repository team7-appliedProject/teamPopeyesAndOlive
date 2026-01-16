"use client";

import { useRouter } from 'next/navigation';
import { Copy, ArrowUpRight, ArrowDownRight, XCircle, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CreditBadge } from '@/components/CreditBadge';

// Mock data
const creditHistory = [
  {
    id: '1',
    type: 'charge',
    amount: 100000,
    creditType: 'starCandy',
    description: '별사탕 충전',
    date: '2026-01-09 14:30',
  },
  {
    id: '2',
    type: 'use',
    amount: 4500,
    creditType: 'starCandy',
    description: 'Figma 고급 테크닉 30가지 글 구매',
    date: '2026-01-08 19:22',
  },
  {
    id: '3',
    type: 'reward',
    amount: 1000,
    creditType: 'spinach',
    description: '회원가입 보상',
    date: '2026-01-05 10:15',
  },
  {
    id: '4',
    type: 'expire',
    amount: 500,
    creditType: 'spinach',
    description: '시금치 만료',
    date: '2026-01-01 00:00',
  },
];

const purchasedContents = [
  {
    id: '1',
    title: 'Figma 고급 테크닉 30가지',
    thumbnail: 'https://images.unsplash.com/photo-1738676524296-364cf18900a8?w=200&h=150&fit=crop',
    purchaseDate: '2026-01-08',
    price: 4500,
  },
  {
    id: '2',
    title: '디지털 일러스트 마스터 클래스',
    thumbnail: 'https://images.unsplash.com/photo-1725347740942-c5306e3c970f?w=200&h=150&fit=crop',
    purchaseDate: '2026-01-06',
    price: 8900,
  },
];

const bookmarkedContents = [
  {
    id: '3',
    title: 'UX 디자인 원칙 완벽 가이드',
    thumbnail: 'https://images.unsplash.com/photo-1738676524296-364cf18900a8?w=200&h=150&fit=crop',
    price: 5500,
  },
];

export default function MyPage() {
  const router = useRouter();
  const userInfo = {
    nickname: '뽀빠이123',
    email: 'popeye@example.com',
    referralCode: 'POPEYE123',
    joinDate: '2026-01-05',
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">마이페이지</h1>
            <p className="text-muted-foreground">내 정보 및 활동 관리</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>프로필</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-center">
                    <div className="h-24 w-24 rounded-full bg-gradient-to-br from-[#5b21b6] to-[#7c3aed] flex items-center justify-center text-4xl">
                      👤
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <h3 className="font-semibold text-lg">{userInfo.nickname}</h3>
                    <p className="text-sm text-muted-foreground">{userInfo.email}</p>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">가입일</span>
                      <span>{userInfo.joinDate}</span>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">추천 코드</span>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-6 px-2"
                          onClick={() => navigator.clipboard.writeText(userInfo.referralCode)}
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          복사
                        </Button>
                      </div>
                      <div className="rounded-lg bg-muted p-2 text-center font-mono">
                        {userInfo.referralCode}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <Button 
                    className="w-full bg-[#5b21b6] hover:bg-[#5b21b6]/90"
                    onClick={() => router.push('/creator')}
                  >
                    올리브로 전환하기
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="credits" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="credits">크레딧 내역</TabsTrigger>
                  <TabsTrigger value="purchased">구매한 글</TabsTrigger>
                  <TabsTrigger value="bookmarked">찜한 글</TabsTrigger>
                </TabsList>

                {/* Credit History */}
                <TabsContent value="credits" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>크레딧 사용 내역</CardTitle>
                      <CardDescription>
                        충전, 사용, 소멸 내역을 확인하세요
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>일시</TableHead>
                            <TableHead>구분</TableHead>
                            <TableHead>내용</TableHead>
                            <TableHead className="text-right">금액</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {creditHistory.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell className="text-sm text-muted-foreground">
                                {item.date}
                              </TableCell>
                              <TableCell>
                                {item.type === 'charge' && (
                                  <Badge className="bg-blue-500">충전</Badge>
                                )}
                                {item.type === 'use' && (
                                  <Badge variant="secondary">사용</Badge>
                                )}
                                {item.type === 'reward' && (
                                  <Badge className="bg-[#22c55e]">지급</Badge>
                                )}
                                {item.type === 'expire' && (
                                  <Badge variant="destructive">소멸</Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-sm">
                                {item.description}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  {item.type === 'charge' || item.type === 'reward' ? (
                                    <ArrowUpRight className="h-4 w-4 text-[#22c55e]" />
                                  ) : item.type === 'expire' ? (
                                    <XCircle className="h-4 w-4 text-destructive" />
                                  ) : (
                                    <ArrowDownRight className="h-4 w-4 text-muted-foreground" />
                                  )}
                                  <CreditBadge 
                                    type={item.creditType} 
                                    amount={item.amount}
                                    size="sm"
                                  />
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Purchased Contents */}
                <TabsContent value="purchased" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>구매한 글</CardTitle>
                      <CardDescription>
                        총 {purchasedContents.length}개의 글을 구매했어요
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {purchasedContents.map((content) => (
                          <div
                            key={content.id}
                            className="flex gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                            onClick={() => router.push(`/content/${content.id}`)}
                          >
                            <img
                              src={content.thumbnail}
                              alt={content.title}
                              className="w-32 h-24 rounded-lg object-cover"
                            />
                            <div className="flex-1">
                              <h4 className="font-semibold mb-2">{content.title}</h4>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                <Calendar className="h-4 w-4" />
                                <span>{content.purchaseDate} 구매</span>
                              </div>
                              <CreditBadge 
                                type="starCandy" 
                                amount={content.price}
                                size="sm"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Bookmarked Contents */}
                <TabsContent value="bookmarked" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>찜한 글</CardTitle>
                      <CardDescription>
                        관심 있는 글을 모아보세요
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {bookmarkedContents.map((content) => (
                          <div
                            key={content.id}
                            className="flex gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                            onClick={() => router.push(`/content/${content.id}`)}
                          >
                            <img
                              src={content.thumbnail}
                              alt={content.title}
                              className="w-32 h-24 rounded-lg object-cover"
                            />
                            <div className="flex-1 flex items-center justify-between">
                              <h4 className="font-semibold">{content.title}</h4>
                              <CreditBadge 
                                type="starCandy" 
                                amount={content.price}
                                size="sm"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

