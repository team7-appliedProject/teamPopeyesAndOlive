"use client";

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Upload, X, Image as ImageIcon, Film } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { contentApi } from '@/app/lib/api';

export default function NewContentPage() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  
  // 글 등록 폼 상태
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [price, setPrice] = useState('');
  const [discount, setDiscount] = useState('');
  const [isFree, setIsFree] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 미디어 업로드 상태
  const [mediaFiles, setMediaFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleFreeToggle = (checked) => {
    setIsFree(checked);
    if (checked) {
      setPrice('0');
    } else {
      setPrice('');
    }
  };

  // 미디어 파일 선택 핸들러
  const handleFileSelect = (files) => {
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(file => 
      file.type.startsWith('image/') || file.type.startsWith('video/')
    );
    
    const newMedia = validFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file),
      type: file.type.startsWith('image/') ? 'image' : 'video',
    }));
    
    setMediaFiles(prev => [...prev, ...newMedia]);
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files);
    }
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
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const handleRemoveMedia = (mediaId) => {
    const mediaToRemove = mediaFiles.find(m => m.id === mediaId);
    if (mediaToRemove) {
      URL.revokeObjectURL(mediaToRemove.preview);
    }
    setMediaFiles(prev => prev.filter(m => m.id !== mediaId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }
    
    if (!content.trim()) {
      alert('내용을 입력해주세요.');
      return;
    }
    
    if (!isFree && (!price || parseInt(price) <= 0)) {
      alert('유료 글은 가격을 입력해주세요.');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const requestData = {
        title: title.trim(),
        content: content.trim(),
        price: isFree ? 0 : parseInt(price) || 0,
        discountRate: parseInt(discount) || 0,
        free: isFree,
      };
      
      console.log('[NewContent] Creating content:', requestData);
      
      const response = await contentApi.create(requestData);
      console.log('[NewContent] Create response:', response);
      
      // TODO: 미디어 파일 업로드 API 호출
      // if (mediaFiles.length > 0) {
      //   await uploadMedia(response, mediaFiles);
      // }
      
      if (response || response === 0) {
        alert('글이 등록되었습니다!');
        router.push('/creator');
      } else {
        alert('글 등록에 실패했습니다.');
      }
    } catch (err) {
      console.error('[NewContent] Create error:', err);
      alert(err.message || '글 등록에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">새 글 등록</h1>
              <p className="text-muted-foreground">판매할 글을 작성하세요</p>
            </div>
          </div>

          {/* Form */}
          <Card>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 제목 */}
                <div className="space-y-2">
                  <Label htmlFor="title">제목 <span className="text-red-500">*</span></Label>
                  <Input 
                    id="title" 
                    placeholder="글 제목을 입력하세요"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={isSubmitting}
                    className="h-11"
                  />
                </div>

                {/* 내용 */}
                <div className="space-y-2">
                  <Label htmlFor="content">내용 <span className="text-red-500">*</span></Label>
                  <Textarea 
                    id="content" 
                    placeholder="글 내용을 입력하세요"
                    rows={12}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    disabled={isSubmitting}
                    className="resize-none"
                  />
                </div>

                {/* 이미지/영상 업로드 */}
                <div className="space-y-2">
                  <Label>이미지 / 영상 업로드</Label>
                  <div
                    className={`
                      border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer
                      ${isDragging 
                        ? 'border-[#5b21b6] bg-[#5b21b6]/5' 
                        : 'border-gray-300 hover:border-[#5b21b6]/50 hover:bg-gray-50'
                      }
                    `}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      className="hidden"
                      onChange={handleFileInputChange}
                    />
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-[#5b21b6]/10 flex items-center justify-center">
                        <Upload className="h-6 w-6 text-[#5b21b6]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-1">
                          파일을 드래그하거나 클릭하여 업로드
                        </p>
                        <p className="text-xs text-muted-foreground">
                          이미지 또는 영상 파일 (여러 개 선택 가능)
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 미디어 미리보기 */}
                  {mediaFiles.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
                      {mediaFiles.map((media) => (
                        <div
                          key={media.id}
                          className="relative group aspect-video rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-100"
                        >
                          {media.type === 'image' ? (
                            <img
                              src={media.preview}
                              alt="Preview"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-gray-900">
                              <Film className="h-8 w-8 text-white" />
                              <video
                                src={media.preview}
                                className="absolute inset-0 h-full w-full object-cover opacity-50"
                              />
                            </div>
                          )}
                          <div className="absolute top-1 left-1">
                            {media.type === 'image' ? (
                              <span className="bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded">IMG</span>
                            ) : (
                              <span className="bg-purple-500 text-white text-[10px] px-1.5 py-0.5 rounded">VID</span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveMedia(media.id);
                            }}
                            className="absolute top-1 right-1 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 무료/유료 설정 - 강조된 스타일 */}
                <div className={`flex items-center justify-between rounded-lg border-2 p-4 transition-colors ${
                  isFree 
                    ? 'border-[#22c55e] bg-[#22c55e]/5' 
                    : 'border-[#f59e0b] bg-[#f59e0b]/5'
                }`}>
                  <div className="space-y-0.5">
                    <Label className="text-base font-semibold">
                      {isFree ? '🆓 무료 글' : '💰 유료 글'}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {isFree ? '누구나 무료로 볼 수 있습니다' : '구매자만 볼 수 있습니다'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${isFree ? 'text-[#22c55e]' : 'text-muted-foreground'}`}>무료</span>
                    <Switch 
                      checked={!isFree}
                      onCheckedChange={(checked) => handleFreeToggle(!checked)}
                      disabled={isSubmitting}
                      className="data-[state=checked]:bg-[#f59e0b] data-[state=unchecked]:bg-[#22c55e]"
                    />
                    <span className={`text-sm font-medium ${!isFree ? 'text-[#f59e0b]' : 'text-muted-foreground'}`}>유료</span>
                  </div>
                </div>

                {/* 가격 설정 (유료인 경우만) */}
                {!isFree && (
                  <div className="grid grid-cols-2 gap-4 p-4 rounded-lg border-2 border-[#f59e0b]/30 bg-[#f59e0b]/5">
                    <div className="space-y-2">
                      <Label htmlFor="price">가격 (별사탕) <span className="text-red-500">*</span></Label>
                      <Input 
                        id="price" 
                        type="number" 
                        placeholder="예: 1000"
                        min="10"
                        step="10"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        disabled={isSubmitting}
                        className="h-11 border-2"
                      />
                      <p className="text-xs text-muted-foreground">10원 단위로 입력</p>
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
                        disabled={isSubmitting}
                        className="h-11 border-2"
                      />
                      <p className="text-xs text-muted-foreground">0~100 사이 입력</p>
                    </div>
                  </div>
                )}

                {/* 버튼 */}
                <div className="flex gap-3 pt-4">
                  <Button 
                    type="button"
                    variant="outline" 
                    onClick={() => router.back()}
                    disabled={isSubmitting}
                    className="flex-1 h-11"
                  >
                    취소
                  </Button>
                  <Button 
                    type="submit"
                    className="flex-1 h-11 bg-[#5b21b6] hover:bg-[#5b21b6]/90"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        등록 중...
                      </>
                    ) : (
                      '등록하기'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
