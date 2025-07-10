
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlayCircle, Clock, Users, BookOpen, TrendingUp, Target, BarChart3, FileText, Brain, Crown } from 'lucide-react';

interface VideoTutorial {
  id: string;
  title: string;
  description: string;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
  videoUrl: string;
  thumbnail: string;
  tags: string[];
}

const videoTutorials: VideoTutorial[] = [
  {
    id: 'intro',
    title: 'Getting Started with InvestReady',
    description: 'Learn the basics of our platform and how to navigate through the investment readiness assessment.',
    duration: '5:30',
    level: 'Beginner',
    category: 'basics',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnail: '/placeholder.svg',
    tags: ['Introduction', 'Platform Overview', 'Navigation']
  },
  {
    id: 'assessment',
    title: 'How to Complete Your Investment Assessment',
    description: 'Step-by-step guide to completing your investment readiness assessment for the best results.',
    duration: '8:15',
    level: 'Beginner',
    category: 'assessment',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnail: '/placeholder.svg',
    tags: ['Assessment', 'Step-by-step', 'Best Practices']
  },
  {
    id: 'results',
    title: 'Understanding Your Investment Readiness Score',
    description: 'Learn how to interpret your score, benchmarks, and recommendations for improvement.',
    duration: '6:45',
    level: 'Intermediate',
    category: 'results',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnail: '/placeholder.svg',
    tags: ['Score Analysis', 'Benchmarking', 'Improvements']
  },
  {
    id: 'pitch-deck',
    title: 'Optimizing Your Pitch Deck with AI Feedback',
    description: 'Master the art of creating compelling pitch decks using our AI-powered feedback system.',
    duration: '12:20',
    level: 'Intermediate',
    category: 'tools',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnail: '/placeholder.svg',
    tags: ['Pitch Deck', 'AI Feedback', 'Presentation']
  },
  {
    id: 'content-analysis',
    title: 'AI Content Analysis Deep Dive',
    description: 'Unlock the full potential of our AI content analysis for business plans and marketing materials.',
    duration: '10:30',
    level: 'Advanced',
    category: 'tools',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnail: '/placeholder.svg',
    tags: ['AI Analysis', 'Content Review', 'Business Plans']
  },
  {
    id: 'investor-matching',
    title: 'Finding the Right Investors',
    description: 'Learn how to use our investor matching system to connect with relevant investors.',
    duration: '9:00',
    level: 'Intermediate',
    category: 'premium',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnail: '/placeholder.svg',
    tags: ['Investor Matching', 'Premium Features', 'Networking']
  },
  {
    id: 'fundraising-tips',
    title: 'Essential Fundraising Strategies',
    description: 'Expert insights on successful fundraising strategies and common pitfalls to avoid.',
    duration: '15:45',
    level: 'Advanced',
    category: 'education',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnail: '/placeholder.svg',
    tags: ['Fundraising', 'Strategy', 'Expert Tips']
  },
  {
    id: 'financial-modeling',
    title: 'Building Investor-Ready Financial Models',
    description: 'Create compelling financial projections that investors want to see.',
    duration: '18:30',
    level: 'Advanced',
    category: 'education',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnail: '/placeholder.svg',
    tags: ['Financial Modeling', 'Projections', 'Investor Relations']
  }
];

const categoryIcons = {
  basics: BookOpen,
  assessment: Target,
  results: BarChart3,
  tools: Brain,
  premium: Crown,
  education: TrendingUp
};

const levelColors = {
  Beginner: 'bg-green-100 text-green-800',
  Intermediate: 'bg-yellow-100 text-yellow-800',
  Advanced: 'bg-red-100 text-red-800'
};

export const EducationalVideos: React.FC = () => {
  const [selectedVideo, setSelectedVideo] = useState<VideoTutorial | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = [
    { id: 'all', name: 'All Videos', icon: PlayCircle },
    { id: 'basics', name: 'Getting Started', icon: BookOpen },
    { id: 'assessment', name: 'Assessment Guide', icon: Target },
    { id: 'results', name: 'Understanding Results', icon: BarChart3 },
    { id: 'tools', name: 'AI Tools', icon: Brain },
    { id: 'premium', name: 'Premium Features', icon: Crown },
    { id: 'education', name: 'Expert Insights', icon: TrendingUp }
  ];

  const filteredVideos = activeCategory === 'all' 
    ? videoTutorials 
    : videoTutorials.filter(video => video.category === activeCategory);

  const VideoCard = ({ video }: { video: VideoTutorial }) => {
    const CategoryIcon = categoryIcons[video.category as keyof typeof categoryIcons];
    
    return (
      <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedVideo(video)}>
        <div className="relative">
          <img 
            src={video.thumbnail} 
            alt={video.title}
            className="w-full h-48 object-cover rounded-t-lg"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-t-lg opacity-0 hover:opacity-100 transition-opacity">
            <PlayCircle className="h-16 w-16 text-white" />
          </div>
          <Badge className={`absolute top-2 right-2 ${levelColors[video.level]}`}>
            {video.level}
          </Badge>
        </div>
        
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <CategoryIcon className="h-4 w-4 text-primary" />
            <span className="text-sm text-muted-foreground capitalize">{video.category}</span>
          </div>
          
          <h3 className="font-semibold mb-2 line-clamp-2">{video.title}</h3>
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{video.description}</p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              {video.duration}
            </div>
            <Button variant="outline" size="sm">
              Watch Now
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-1 mt-3">
            {video.tags.slice(0, 3).map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">Video Tutorials & Guides</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Master our platform and learn essential fundraising skills with our comprehensive video library
        </p>
      </div>

      {/* Video Player Modal */}
      {selectedVideo && (
        <Card className="border-2 border-primary">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{selectedVideo.title}</CardTitle>
                <p className="text-muted-foreground mt-2">{selectedVideo.description}</p>
              </div>
              <Button variant="outline" onClick={() => setSelectedVideo(null)}>
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="aspect-video">
              <iframe
                src={selectedVideo.videoUrl}
                title={selectedVideo.title}
                className="w-full h-full rounded-lg"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {selectedVideo.tags.map(tag => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category Tabs */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7 mb-6">
          {categories.map(category => {
            const Icon = category.icon;
            return (
              <TabsTrigger 
                key={category.id} 
                value={category.id}
                className="flex items-center gap-1 text-xs"
              >
                <Icon className="h-3 w-3" />
                <span className="hidden sm:inline">{category.name}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {categories.map(category => (
          <TabsContent key={category.id} value={category.id}>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(category.id === 'all' ? videoTutorials : filteredVideos).map(video => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Learning Path Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Recommended Learning Path
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
              <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">1</div>
              <div>
                <p className="font-medium">Start with Platform Basics</p>
                <p className="text-sm text-muted-foreground">Get familiar with navigation and core features</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
              <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">2</div>
              <div>
                <p className="font-medium">Complete Your First Assessment</p>
                <p className="text-sm text-muted-foreground">Follow our step-by-step assessment guide</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
              <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">3</div>
              <div>
                <p className="font-medium">Understand Your Results</p>
                <p className="text-sm text-muted-foreground">Learn to interpret scores and implement recommendations</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
              <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">4</div>
              <div>
                <p className="font-medium">Master AI Tools</p>
                <p className="text-sm text-muted-foreground">Enhance your pitch materials with AI feedback</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
