import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Mail, 
  MapPin, 
  Building, 
  Globe, 
  Calendar,
  Edit3,
  Save,
  X,
  TrendingUp,
  FileText,
  Image,
  Type,
  Scissors,
  Crown
} from 'lucide-react';
import { toast } from 'sonner';
import { useUserProfile, updateUserProfile } from '@/hooks/useApi';

const Profile = () => {
  const { data: profileData, loading, error, refetch } = useUserProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    bio: '',
    company: '',
    location: '',
    website: ''
  });

  useEffect(() => {
    if (profileData?.user) {
      setFormData({
        username: profileData.user.username || '',
        email: profileData.user.email || '',
        bio: profileData.user.bio || '',
        company: profileData.user.company || '',
        location: profileData.user.location || '',
        website: profileData.user.website || ''
      });
    }
  }, [profileData]);

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateUserProfile(formData);
      await refetch();
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profileData?.user) {
      setFormData({
        username: profileData.user.username || '',
        email: profileData.user.email || '',
        bio: profileData.user.bio || '',
        company: profileData.user.company || '',
        location: profileData.user.location || '',
        website: profileData.user.website || ''
      });
    }
    setIsEditing(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-24">
            <div className="loading-spinner w-8 h-8"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-24">
            <p className="text-destructive">Error loading profile: {error}</p>
            <Button onClick={refetch} className="mt-4">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!profileData || !profileData.user) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-24">
            <div className="loading-spinner w-8 h-8"></div>
          </div>
        </div>
      </div>
    );
  }

  const { user, usage, recentActivity } = profileData;

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center">
              <User className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Profile</h1>
              <p className="text-muted-foreground">Manage your account information and preferences</p>
            </div>
          </div>
          
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)}>
              <Edit3 className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={handleCancel} variant="outline" size="sm">
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave} size="sm" disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Personal Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="glass border-border/20">
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Update your personal details and contact information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 mb-6">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src="" alt={user.username} />
                    <AvatarFallback className="text-lg">
                      {getInitials(user.username)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold">{user.username}</h3>
                    <p className="text-muted-foreground">{user.email}</p>
                    <p className="text-sm text-muted-foreground">
                      Member since {formatDate(user.joinDate)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    {isEditing ? (
                      <Input
                        id="username"
                        value={formData.username}
                        onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                      />
                    ) : (
                      <div className="flex items-center gap-2 p-2 text-sm">
                        <User className="w-4 h-4 text-muted-foreground" />
                        {user.username}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    {isEditing ? (
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      />
                    ) : (
                      <div className="flex items-center gap-2 p-2 text-sm">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        {user.email}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    {isEditing ? (
                      <Input
                        id="company"
                        value={formData.company}
                        onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                        placeholder="Your company"
                      />
                    ) : (
                      <div className="flex items-center gap-2 p-2 text-sm">
                        <Building className="w-4 h-4 text-muted-foreground" />
                        {user.company || 'Not specified'}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    {isEditing ? (
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="Your location"
                      />
                    ) : (
                      <div className="flex items-center gap-2 p-2 text-sm">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        {user.location || 'Not specified'}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="website">Website</Label>
                    {isEditing ? (
                      <Input
                        id="website"
                        value={formData.website}
                        onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                        placeholder="https://your-website.com"
                      />
                    ) : (
                      <div className="flex items-center gap-2 p-2 text-sm">
                        <Globe className="w-4 h-4 text-muted-foreground" />
                        {user.website || 'Not specified'}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  {isEditing ? (
                    <Textarea
                      id="bio"
                      rows={3}
                      value={formData.bio}
                      onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder="Tell us about yourself..."
                    />
                  ) : (
                    <p className="p-2 text-sm text-muted-foreground min-h-[60px]">
                      {user.bio || 'No bio provided'}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Usage Statistics */}
          <div className="space-y-6">
            <Card className="glass border-border/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Usage Statistics
                </CardTitle>
                <CardDescription>
                  Your AI generation activity
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-500" />
                      <span className="text-sm">Articles</span>
                    </div>
                    <span className="text-sm font-medium">{usage.articles}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Image className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Images</span>
                    </div>
                    <span className="text-sm font-medium">{usage.images}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Type className="w-4 h-4 text-purple-500" />
                      <span className="text-sm">Titles</span>
                    </div>
                    <span className="text-sm font-medium">{usage.titles}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Scissors className="w-4 h-4 text-orange-500" />
                      <span className="text-sm">BG Removals</span>
                    </div>
                    <span className="text-sm font-medium">{usage.backgroundRemovals}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-border/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-yellow-500" />
                  Plan Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Current Plan</span>
                    <Badge className="capitalize">Free</Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Recent Activity (Last 30 days)
                    </p>
                    <div className="text-2xl font-bold text-primary">
                      {recentActivity.total}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Total generations this month
                    </p>
                  </div>

                  <Button className="w-full" variant="outline">
                    Upgrade Plan
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-border/20">
              <CardHeader>
                <CardTitle>Account Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>Joined {formatDate(user.joinDate)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>Last active {formatDate(user.lastActive)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;