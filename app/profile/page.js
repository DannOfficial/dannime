'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User as UserIcon, Mail, Calendar, Heart, History as HistoryIcon, Trophy, Award, Star, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import useStore from '@/lib/store';

export default function ProfilePage() {
  const router = useRouter();
  const { user, favorites, watchHistory } = useStore();
  const [loading, setLoading] = useState(true);
  const [levelStats, setLevelStats] = useState(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else {
      fetchLevelStats();
      setLoading(false);
    }
  }, [user, router]);

  const fetchLevelStats = async () => {
    if (!user?.id) return;
    
    try {
      const response = await fetch(`/api/user/profile?userId=${user.id}`);
      const data = await response.json();
      if (data.success && data.data.levelStats) {
        setLevelStats(data.data.levelStats);
      }
    } catch (error) {
      console.error('Error fetching level stats:', error);
    }
  };

  const getRoleColor = (role) => {
    const colors = {
      Bronze: 'bg-orange-700 text-white',
      Silver: 'bg-gray-400 text-black',
      Gold: 'bg-yellow-500 text-black',
      Platinum: 'bg-cyan-500 text-white',
      Diamond: 'bg-blue-600 text-white',
    };
    return colors[role] || 'bg-gray-500 text-white';
  };

  if (loading || !user) {
    return (
      <div className="container mx-auto px-4 py-12 min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user.image} alt={user.name} />
                  <AvatarFallback className="text-2xl">
                    {user.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                {user.isAdmin && (
                  <Badge className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600">
                    Admin
                  </Badge>
                )}
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center gap-3 justify-center md:justify-start mb-2">
                  <h1 className="text-3xl font-bold">{user.name}</h1>
                  <Badge className={`${getRoleColor(user.role)} text-sm`}>
                    <Award className="h-3 w-3 mr-1" />
                    {user.role}
                  </Badge>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-2 justify-center md:justify-start">
                    <Mail className="h-4 w-4" />
                    {user.email}
                  </div>
                  {user.createdAt && (
                    <div className="flex items-center gap-2 justify-center md:justify-start">
                      <Calendar className="h-4 w-4" />
                      Joined {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Level & XP Stats */}
        {levelStats && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Trophy className="mr-2 h-5 w-5 text-yellow-500" />
                Level & Experience
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Current Level</p>
                  <p className="text-4xl font-bold flex items-center gap-2">
                    {levelStats.currentLevel}
                    <span className="text-lg text-muted-foreground">/ {levelStats.nextLevel}</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground mb-1">Total XP</p>
                  <p className="text-2xl font-bold text-primary">{levelStats.totalXP.toLocaleString()}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progress to Level {levelStats.nextLevel}</span>
                  <span className="font-medium">
                    {levelStats.xpInCurrentLevel} / {levelStats.xpNeededForNextLevel} XP
                  </span>
                </div>
                <Progress value={levelStats.progress} className="h-3" />
                <p className="text-xs text-center text-muted-foreground">
                  {levelStats.progress}% complete
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <p className="text-sm text-muted-foreground">Next Role</p>
                  </div>
                  <Badge className={`${getRoleColor(levelStats.nextRole)}`}>
                    {levelStats.nextRole}
                  </Badge>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <p className="text-sm text-muted-foreground">XP per Episode</p>
                  </div>
                  <p className="text-lg font-bold">50 XP</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Heart className="mr-2 h-5 w-5 text-red-500" />
                Favorites
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">{favorites.length}</p>
                  <p className="text-sm text-muted-foreground">Anime saved</p>
                </div>
                <Button asChild>
                  <Link href="/favorites">View All</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <HistoryIcon className="mr-2 h-5 w-5 text-blue-500" />
                Watch History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">{watchHistory.length}</p>
                  <p className="text-sm text-muted-foreground">Episodes watched</p>
                </div>
                <Button asChild variant="outline">
                  <Link href="/history">View History</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Account Info */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Provider</p>
                <p className="text-sm text-muted-foreground capitalize">
                  {user.provider || 'Email'}
                </p>
              </div>
            </div>
            
            <Separator />
            
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Email Verified</p>
                <p className="text-sm text-muted-foreground">
                  {user.emailVerified ? 'Yes' : 'No'}
                </p>
              </div>
            </div>

            <Separator />

            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Account ID</p>
                <p className="text-sm text-muted-foreground font-mono">
                  {user.id}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
