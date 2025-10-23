'use client';
import { CheckCircle2, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const updates = [
  {
    version: '1.0.0',
    date: 'January 2025',
    type: 'Launch',
    changes: [
      'Initial release of DannNime',
      'Browse latest anime episodes',
      'Search functionality',
      'Anime detail pages with full information',
      'Episode streaming with multiple quality options',
      'User authentication (Email, Google, GitHub)',
      'User profiles with favorites and watch history',
      'Dark and light theme support',
      'Responsive design for all devices',
      'Comments system for anime discussions',
      'Genre browsing',
      'Download links for episodes',
    ]
  },
];

export default function ChangelogPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20 mb-4">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">What's New</span>
          </div>
          <h1 className="text-4xl font-bold mb-4">Changelog</h1>
          <p className="text-lg text-muted-foreground">
            Track all updates and improvements to DannNime
          </p>
        </div>

        <div className="space-y-8">
          {updates.map((update, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl mb-2">Version {update.version}</CardTitle>
                    <p className="text-sm text-muted-foreground">{update.date}</p>
                  </div>
                  <Badge variant={update.type === 'Launch' ? 'default' : 'secondary'}>
                    {update.type}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {update.changes.map((change, changeIndex) => (
                    <li key={changeIndex} className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{change}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-8 bg-muted/50">
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground">
              More updates coming soon! Stay tuned for new features and improvements.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
