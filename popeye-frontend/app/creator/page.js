"use client";

import { useState, useRef } from 'react';
import { Plus, Eye, Heart, ShoppingCart, TrendingUp, Upload, X, Image as ImageIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

// Mock data
const myContents = [
  {
    id: '1',
    title: 'Figma 고급 테크닉 30가지',
    status: 'active',
    views: 5678,
    likes: 1243,
    sales: 89,
    revenue: 400500,
    price: 4500,
    isFree: false,
  },
  {
    id: '2',
    title: 'React 컴포넌트 디자인 패턴',
    status: 'active',
    views: 3421,
    likes: 892,
    sales: 67,
    revenue: 534000,
    price: 8000,
    isFree: false,
  },
  {
    id: '3',
    title: '초보자를 위한 디자인 기초',
    status: 'inactive',
    views: 1234,
    likes: 456,
    sales: 0,
    revenue: 0,
    price: 0,
    isFree: true,
  },
];

export default function CreatorPage() {
  const [isCreator, setIsCreator] = useState(true);
  const [newContentOpen, setNewContentOpen] = useState(false);
  
  // 글 등록 폼 상태
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [price, setPrice] = useState('');
  const [discount, setDiscount] = useState('');
  const [isFree, setIsFree] = useState(false);
  const [images, setImages] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Creator stats
  const stats = {
    totalRevenue: 934500,
    totalSales: 156,
    totalViews: 10333,
    totalLikes: 2591,
    platformFee: 93450, // 10%
    expectedSettlement: 841050, // 90%
  };

  // 이미지 업로드 핸들러
  const handleImageSelect = (files) => {
    const fileArray = Array.from(files);
    const imageFiles = fileArray.filter(file => file.type.startsWith('image/'));
    
    const newImages = imageFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file),
    }));
    
    setImages([...images, ...newImages]);
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleImageSelect(e.target.files);
    }
    // Reset input to allow selecting same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleImageSelect(e.dataTransfer.files);
    }
  };

  const handleRemoveImage = (imageId) => {
    const imageToRemove = images.find(img => img.id === imageId);
    if (imageToRemove) {
      URL.revokeObjectURL(imageToRemove.preview);
    }
    setImages(images.filter(img => img.id !== imageId));
  };

  // 무료 글 체크 핸들러
  const handleFreeToggle = (checked) => {
    setIsFree(checked);
    if (checked) {
      setPrice('0');
    }
  };

  // Dialog 닫을 때 폼 초기화
  const handleDialogClose = (open) => {
    setNewContentOpen(open);
    if (!open) {
      // 폼 초기화
      setTitle('');
      setDescription('');
      setContent('');
      setPrice('');
      setDiscount('');
      setIsFree(false);
      // 이미지 URL 정리
      images.forEach(img => URL.revokeObjectURL(img.preview));
      setImages([]);
    }
  };

  if (!isCreator) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[#5b21b6] to-[#7c3aed] flex items-center justify-center text-3xl">
                🫒
              </div>
            </div>
            <CardTitle>올리브로 전환하기</CardTitle>
            <CardDescription>
              작가가 되어 글을 판매하고 수익을 얻으세요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted p-4 space-y-2 text-sm">
              <p>✨ 올리브 혜택:</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>• 글 판매 수익의 90% 정산</li>
                <li>• 무제한 글 업로드</li>
                <li>• 상세한 판매 통계 제공</li>
                <li>• 정산 자동 처리</li>
              </ul>
            </div>
            <Button 
              className="w-full bg-[#5b21b6] hover:bg-[#5b21b6]/90"
              onClick={() => setIsCreator(true)}
            >
              올리브로 전환
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">올리브 대시보드</h1>
              <p className="text-muted-foreground">글 관리 및 수익 확인</p>
            </div>
            <Dialog open={newContentOpen} onOpenChange={handleDialogClose}>
              <DialogTrigger asChild>
                <Button className="bg-[#5b21b6] hover:bg-[#5b21b6]/90">
                  <Plus className="h-4 w-4 mr-2" />
                  글 등록
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>새 글 등록</DialogTitle>
                  <DialogDescription>
                    판매할 글을 등록하세요
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">제목</Label>
                    <Input 
                      id="title" 
                      placeholder="글 제목을 입력하세요"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">설명</Label>
                    <Textarea 
                      id="description" 
                      placeholder="글 설명을 입력하세요"
                      rows={5}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="content">글 내용</Label>
                    <Textarea 
                      id="content" 
                      placeholder="글 본문을 입력하세요"
                      rows={8}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                    />
                  </div>

                  {/* 이미지 업로드 섹션 */}
                  <div className="space-y-2">
                    <Label>이미지 업로드</Label>
                    <div
                      className={`
                        border-2 border-dashed rounded-lg p-6 text-center transition-colors
                        ${isDragging 
                          ? 'border-[#5b21b6] bg-[#5b21b6]/5' 
                          : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                        }
                      `}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleFileInputChange}
                      />
                      <div className="flex flex-col items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                          <Upload className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-1">
                            이미지를 드래그 앤 드롭하거나 클릭하여 선택하세요
                          </p>
                          <p className="text-xs text-muted-foreground">
                            여러 장 선택 가능 (최소 1장)
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <ImageIcon className="h-4 w-4 mr-2" />
                          이미지 선택
                        </Button>
                      </div>
                      {/* TODO: 이미지 업로드 API 연동 예정 */}
                    </div>

                    {/* 이미지 미리보기 */}
                    {images.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
                        {images.map((image) => (
                          <div
                            key={image.id}
                            className="relative group aspect-video rounded-lg overflow-hidden border bg-muted"
                          >
                            <img
                              src={image.preview}
                              alt="Preview"
                              className="h-full w-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(image.id)}
                              className="absolute top-2 right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">가격 (10원 단위)</Label>
                      <Input 
                        id="price" 
                        type="number" 
                        placeholder={isFree ? "0" : "4500"}
                        step="10"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        disabled={isFree}
                        className={isFree ? "bg-muted cursor-not-allowed" : ""}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="discount">할인율 (%)</Label>
                      <Input 
                        id="discount" 
                        type="number" 
                        placeholder="0"
                        min="0"
                        max="100"
                        value={discount}
                        onChange={(e) => setDiscount(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <Label>무료 글</Label>
                      <p className="text-sm text-muted-foreground">
                        무료로 제공할 글인가요?
                      </p>
                    </div>
                    <Switch 
                      checked={isFree}
                      onCheckedChange={handleFreeToggle}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => handleDialogClose(false)}>
                    취소
                  </Button>
                  <Button 
                    className="bg-[#5b21b6] hover:bg-[#5b21b6]/90"
                    onClick={() => {
                      // TODO: 실제 글 등록 API 호출
                      // TODO: 이미지 업로드 API 연동 예정
                      console.log({
                        title,
                        description,
                        content,
                        price: isFree ? 0 : parseInt(price) || 0,
                        discount: parseInt(discount) || 0,
                        isFree,
                        images: images.map(img => ({ name: img.file.name, size: img.file.size })),
                      });
                      handleDialogClose(false);
                    }}
                  >
                    등록하기
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>누적 매출</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-[#22c55e]" />
                  <span className="text-2xl font-bold">
                    ₩{stats.totalRevenue.toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>판매 수</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-[#5b21b6]" />
                  <span className="text-2xl font-bold">
                    {stats.totalSales.toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>총 조회수</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-blue-500" />
                  <span className="text-2xl font-bold">
                    {stats.totalViews.toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>총 좋아요</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  <span className="text-2xl font-bold">
                    {stats.totalLikes.toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            {/* Revenue Card */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>정산 요약</CardTitle>
                <CardDescription>이번 달 정산 예정 금액</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">총 매출</span>
                    <span>₩{stats.totalRevenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">플랫폼 수수료 (10%)</span>
                    <span className="text-destructive">-₩{stats.platformFee.toLocaleString()}</span>
                  </div>
                  <Separator className="my-3" />
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">정산 예정 금액</span>
                    <span className="text-xl font-bold text-[#22c55e]">
                      ₩{stats.expectedSettlement.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
                  <p>💡 매월 1일 자동 정산됩니다</p>
                  <p className="mt-1">정산일: 2026-02-01</p>
                </div>
              </CardContent>
            </Card>

            {/* Content List */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>내 글</CardTitle>
                  <CardDescription>
                    총 {myContents.length}개의 글
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>제목</TableHead>
                        <TableHead>상태</TableHead>
                        <TableHead className="text-right">조회/좋아요</TableHead>
                        <TableHead className="text-right">판매/매출</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {myContents.map((content) => (
                        <TableRow key={content.id}>
                          <TableCell className="font-medium">
                            {content.title}
                          </TableCell>
                          <TableCell>
                            {content.status === 'active' ? (
                              <Badge className="bg-[#22c55e]">활성</Badge>
                            ) : (
                              <Badge variant="secondary">비활성</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right text-sm">
                            <div className="flex items-center justify-end gap-2">
                              <span className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                {content.views.toLocaleString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <Heart className="h-3 w-3" />
                                {content.likes.toLocaleString()}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="text-sm">
                              <div className="font-medium">
                                {content.sales.toLocaleString()}건
                              </div>
                              <div className="text-muted-foreground">
                                ₩{content.revenue.toLocaleString()}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

