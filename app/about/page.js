'use client';
import { Film, Heart, Star, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import Logo from '@/components/Logo';

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <Logo size={120} />
          </div>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            About DannNime
          </h1>
          <p className="text-lg text-muted-foreground">
            Your ultimate destination for streaming anime
          </p>
        </div>

        {/* Mission */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
            <p className="text-muted-foreground leading-relaxed">
              DannNime is dedicated to providing anime fans with the best streaming experience. 
              We offer the latest anime episodes with high-quality subtitles, making it easy for 
              everyone to enjoy their favorite series. Our platform is designed to be user-friendly, 
              fast, and accessible on all devices.
            </p>
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Film className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Vast Library</h3>
                  <p className="text-sm text-muted-foreground">
                    Access thousands of anime series and movies from various genres
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Star className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">HD Quality</h3>
                  <p className="text-sm text-muted-foreground">
                    Stream in high definition with multiple quality options available
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">User Favorites</h3>
                  <p className="text-sm text-muted-foreground">
                    Create your own list of favorite anime and track your watch history
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Community</h3>
                  <p className="text-sm text-muted-foreground">
                    Join our community and share your thoughts through comments
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Technology */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold mb-4">Technology Stack</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              DannNime is built with modern web technologies to ensure the best performance and user experience:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li><strong>Frontend:</strong> Next.js 14, React, TailwindCSS, shadcn/ui</li>
              <li><strong>Backend:</strong> Next.js API Routes, Node.js</li>
              <li><strong>Database:</strong> MongoDB with Mongoose</li>
              <li><strong>Authentication:</strong> NextAuth with Google & GitHub OAuth</li>
              <li><strong>State Management:</strong> Zustand</li>
            </ul>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Get in Touch</h2>
            <p className="text-muted-foreground mb-4">
              Have questions or feedback? We'd love to hear from you!
            </p>
            <p className="text-sm text-muted-foreground">
              Email us at: <span className="text-primary font-semibold">support@dannnime.com</span>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
