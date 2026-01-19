"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ContentCard } from '@/components/ContentCard';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { contentApi, mainApi } from '@/app/lib/api';

export default function Home() {
  const router = useRouter();
  const [contents, setContents] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalContents: 0, totalOlive: 0, totalPopeye: 0 });

  // 메인 통계 가져오기
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await mainApi.getMain().catch(() => null);
        if (data) {
          setStats({
            totalContents: data.totalContents || 0,
            totalOlive: data.totalOlive || 0,
            totalPopeye: data.totalPopeye || 0,
          });
        }
      } catch (err) {
        console.error('Failed to fetch main stats:', err);
      }
    };

    fetchStats();
  }, []);

  // 탭 변경 시 해당 API 호출
  useEffect(() => {
    const fetchContents = async () => {
      try {
        setLoading(true);
        
        let data = [];
        
        switch (activeTab) {
          case 'free':
            data = await contentApi.getFree(0, 20).catch(() => []);
            break;
          case 'paid':
            data = await contentApi.getPaid(0, 20).catch(() => []);
            break;
          case 'all':
          default:
            data = await contentApi.getAll(0, 20).catch(() => []);
            break;
        }
        
        console.log(`[Home] Fetched ${activeTab} contents:`, data);
        setContents(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to fetch contents:', err);
        setContents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchContents();
  }, [activeTab]);

  const handleLike = async (contentId) => {
    try {
      const response = await contentApi.toggleLike(contentId);
      // 서버 응답으로 상태 업데이트
      setContents(contents.map(c => {
        const id = c.contentId || c.id;
        if (id === contentId) {
          return { 
            ...c, 
            isLiked: response.liked,
            liked: response.liked,
            likeCount: response.likeCount,
            likes: response.likeCount
          };
        }
        return c;
      }));
    } catch (err) {
      console.error('[Home] Like error:', err);
      if (err.status === 401 || err.status === 403) {
        router.push('/login');
      } else {
        alert('좋아요 처리에 실패했습니다.');
      }
    }
  };

  const handleBookmark = async (contentId) => {
    try {
      const response = await contentApi.toggleBookmark(contentId);
      // 서버 응답으로 상태 업데이트
      setContents(contents.map(c => {
        const id = c.contentId || c.id;
        if (id === contentId) {
          return { 
            ...c, 
            isBookmarked: response.bookmarked,
            bookmarked: response.bookmarked
          };
        }
        return c;
      }));
    } catch (err) {
      console.error('[Home] Bookmark error:', err);
      if (err.status === 401 || err.status === 403) {
        router.push('/login');
      } else {
        alert('북마크 처리에 실패했습니다.');
      }
    }
  };

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
              <div className="text-2xl font-bold">{stats.totalContents.toLocaleString()}</div>
            </div>
            <div className="rounded-lg bg-white/10 backdrop-blur-sm px-4 py-3">
              <div className="text-sm text-white/80">활동 올리브</div>
              <div className="text-2xl font-bold">{stats.totalOlive.toLocaleString()}</div>
            </div>
            <div className="rounded-lg bg-white/10 backdrop-blur-sm px-4 py-3">
              <div className="text-sm text-white/80">뽀빠이들</div>
              <div className="text-2xl font-bold">{stats.totalPopeye.toLocaleString()}</div>
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
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : contents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contents.map((content, index) => (
            <ContentCard
                key={content.contentId || content.id || index}
              content={content}
              onLike={handleLike}
              onBookmark={handleBookmark}
            />
          ))}
        </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <p className="text-lg">
              {activeTab === 'free' ? '무료 글이 없습니다.' : 
               activeTab === 'paid' ? '유료 글이 없습니다.' : 
               '등록된 글이 없습니다.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
