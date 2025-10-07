import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { User, Briefcase, DollarSign, MapPin, Target } from 'lucide-react';

export default function ProfilePage() {
  const { toast } = useToast();
  const [profile, setProfile] = useState({
    name: 'John Investor',
    organization: 'Tech Ventures Capital',
    bio: 'Early-stage investor focused on AI and SaaS startups',
    sectors: ['AI/ML', 'FinTech', 'SaaS'],
    stages: ['Pre-Seed', 'Seed'],
    regions: ['US', 'EU'],
    ticketMin: 50000,
    ticketMax: 500000,
  });

  const handleSave = () => {
    toast({
      title: 'Profile Updated',
      description: 'Your investor profile has been saved successfully.',
    });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-3xl font-bold mb-2">Investor Profile</h2>
        <p className="text-muted-foreground">
          Manage your investment preferences and criteria
        </p>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input 
              id="name" 
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="organization">Organization</Label>
            <Input 
              id="organization" 
              value={profile.organization}
              onChange={(e) => setProfile({ ...profile, organization: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea 
              id="bio" 
              rows={4}
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Investment Criteria */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Investment Criteria
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Preferred Sectors</Label>
            <div className="flex gap-2 flex-wrap">
              {['AI/ML', 'FinTech', 'SaaS', 'HealthTech', 'CleanTech', 'EdTech'].map(sector => (
                <Badge 
                  key={sector}
                  variant={profile.sectors.includes(sector) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => {
                    const newSectors = profile.sectors.includes(sector)
                      ? profile.sectors.filter(s => s !== sector)
                      : [...profile.sectors, sector];
                    setProfile({ ...profile, sectors: newSectors });
                  }}
                >
                  {sector}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Investment Stages</Label>
            <div className="flex gap-2 flex-wrap">
              {['Pre-Seed', 'Seed', 'Series A', 'Series B'].map(stage => (
                <Badge 
                  key={stage}
                  variant={profile.stages.includes(stage) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => {
                    const newStages = profile.stages.includes(stage)
                      ? profile.stages.filter(s => s !== stage)
                      : [...profile.stages, stage];
                    setProfile({ ...profile, stages: newStages });
                  }}
                >
                  {stage}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Geographic Focus</Label>
            <div className="flex gap-2 flex-wrap">
              {['US', 'EU', 'Asia', 'LATAM', 'Africa'].map(region => (
                <Badge 
                  key={region}
                  variant={profile.regions.includes(region) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => {
                    const newRegions = profile.regions.includes(region)
                      ? profile.regions.filter(r => r !== region)
                      : [...profile.regions, region];
                    setProfile({ ...profile, regions: newRegions });
                  }}
                >
                  {region}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ticket Size */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Ticket Size Range
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ticketMin">Minimum Investment</Label>
              <Input 
                id="ticketMin" 
                type="number"
                value={profile.ticketMin}
                onChange={(e) => setProfile({ ...profile, ticketMin: parseInt(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ticketMax">Maximum Investment</Label>
              <Input 
                id="ticketMax" 
                type="number"
                value={profile.ticketMax}
                onChange={(e) => setProfile({ ...profile, ticketMax: parseInt(e.target.value) })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} className="w-full md:w-auto">
        Save Profile
      </Button>
    </div>
  );
}
