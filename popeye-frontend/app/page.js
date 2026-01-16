"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ContentCard } from '@/components/ContentCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock data
const mockContents = [
  {
    id: '1',
    title: '프로 디자이너가 알려주는 Figma 고급 테크닉 30가지',
    creatorName: '디자인올리브',
    creatorAvatar: 'https://images.unsplash.com/photo-1581065178047-8ee15951ede6?w=100&h=100&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1738676524296-364cf18900a8?w=400&h=300&fit=crop',
    price: 4500,
    originalPrice: 6000,
    isFree: false,
    likes: 1243,
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: '2',
    title: '무료로 배우는 React 기초부터 실전까지',
    creatorName: '코딩올리브',
    creatorAvatar: 'https://images.unsplash.com/photo-1581065178047-8ee15951ede6?w=100&h=100&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1603219950587-b4f3f7ee87e7?w=400&h=300&fit=crop',
    price: 0,
    isFree: true,
    likes: 3521,
    isLiked: true,
    isBookmarked: false,
  },
  {
    id: '3',
    title: '디지털 일러스트 마스터 클래스 - 캐릭터 드로잉',
    creatorName: '아트올리브',
    creatorAvatar: 'https://images.unsplash.com/photo-1581065178047-8ee15951ede6?w=100&h=100&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1725347740942-c5306e3c970f?w=400&h=300&fit=crop',
    price: 8900,
    originalPrice: 12000,
    isFree: false,
    likes: 892,
    isLiked: false,
    isBookmarked: true,
  },
  {
    id: '4',
    title: '작업 효율을 200% 높이는 워크스페이스 설정법',
    creatorName: '프로덕티브올리브',
    creatorAvatar: 'https://images.unsplash.com/photo-1581065178047-8ee15951ede6?w=100&h=100&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1741466072239-fafcc7052467?w=400&h=300&fit=crop',
    price: 3500,
    isFree: false,
    likes: 2156,
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: '5',
    title: '초보자를 위한 컬러 팔레트 만들기 가이드',
    creatorName: '컬러올리브',
    creatorAvatar: 'https://images.unsplash.com/photo-1581065178047-8ee15951ede6?w=100&h=100&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1705254613735-1abb457f8a60?w=400&h=300&fit=crop',
    price: 0,
    isFree: true,
    likes: 4782,
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: '6',
    title: 'UX 디자인 원칙: 사용자 중심 디자인 완벽 가이드',
    creatorName: 'UX올리브',
    creatorAvatar: 'https://images.unsplash.com/photo-1581065178047-8ee15951ede6?w=100&h=100&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1738676524296-364cf18900a8?w=400&h=300&fit=crop',
    price: 5500,
    originalPrice: 8000,
    isFree: false,
    likes: 1678,
    isLiked: false,
    isBookmarked: false,
  },
];

export default function Home() {
  const router = useRouter();
  const [contents, setContents] = useState(mockContents);
  const [activeTab, setActiveTab] = useState('all');

  const handleLike = (contentId) => {
    setContents(contents.map(c => 
      c.id === contentId 
        ? { ...c, isLiked: !c.isLiked, likes: c.isLiked ? c.likes - 1 : c.likes + 1 }
        : c
    ));
  };

  const handleBookmark = (contentId) => {
    setContents(contents.map(c => 
      c.id === contentId 
        ? { ...c, isBookmarked: !c.isBookmarked }
        : c
    ));
  };

  const filteredContents = activeTab === 'all' 
    ? contents 
    : activeTab === 'free'
    ? contents.filter(c => c.isFree)
    : contents.filter(c => !c.isFree);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="mb-12 rounded-2xl bg-gradient-to-r from-[#5b21b6] to-[#7c3aed] p-8 text-white">
          <h1 className="text-4xl font-bold mb-4">
            프리미엄 글을 읽고 싶다면
          </h1>
          <p className="text-lg text-white/90 mb-6">
            뽀빠이들을 위한 유료 블로그 글 구매 플랫폼 StarP
          </p>
          <div className="flex gap-4">
            <div className="rounded-lg bg-white/10 backdrop-blur-sm px-4 py-3">
              <div className="text-sm text-white/80">전체 글</div>
              <div className="text-2xl font-bold">1,234</div>
            </div>
            <div className="rounded-lg bg-white/10 backdrop-blur-sm px-4 py-3">
              <div className="text-sm text-white/80">활동 작가</div>
              <div className="text-2xl font-bold">456</div>
            </div>
            <div className="rounded-lg bg-white/10 backdrop-blur-sm px-4 py-3">
              <div className="text-sm text-white/80">뽀빠이들</div>
              <div className="text-2xl font-bold">12,345</div>
            </div>
          </div>
        </div>

        {/* Content Filter */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList>
            <TabsTrigger value="all">전체</TabsTrigger>
            <TabsTrigger value="free">무료</TabsTrigger>
            <TabsTrigger value="paid">유료</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContents.map(content => (
            <ContentCard
              key={content.id}
              content={content}
              onLike={handleLike}
              onBookmark={handleBookmark}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

