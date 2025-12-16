import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Save,
  Eye,
  EyeOff,
  Trash2,
  AlertTriangle,
  Monitor,
  Sun,
  Moon
} from 'lucide-react';
import { toast } from 'sonner';

interface UserSettings {
  // Appearance
  theme: 'light' | 'dark' | 'system';
  language: string;
  
  // Notifications
  emailNotifications: boolean;
  pushNotifications: boolean;
  marketingEmails: boolean;
  weeklyDigest: boolean;
  
  // Privacy & Security
  profileVisibility: 'public' | 'private';
  dataSharing: boolean;
  analytics: boolean;
  twoFactorAuth: boolean;
  
  // API & Integrations
  apiKey?: string;
  webhookUrl?: string;
  autoSave: boolean;
  
  // Content Preferences
  defaultImageStyle: string;
  defaultImageSize: string;
  contentLanguage: string;
  qualityPreference: 'fast' | 'balanced' | 'quality';
}

const Settings = () => {
  const [settings, setSettings] = useState<UserSettings>({
    theme: 'system',
    language: 'en',
    emailNotifications: true,
    pushNotifications: false,
    marketingEmails: false,
    weeklyDigest: true,
    profileVisibility: 'public',
    dataSharing: false,
    analytics: true,
    twoFactorAuth: false,
    autoSave: true,
    defaultImageStyle: 'realistic',
    defaultImageSize: '1024x1024',
    contentLanguage: 'en',
    qualityPreference: 'balanced'
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    // Simulate loading settings
    const loadSettings = async () => {
      try {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        // In real app, this would fetch from API
      } catch (error) {
        console.error('Error loading settings:', error);
        toast.error('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      // In real app, this would save to API
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    try {
      // In real app, this would call password change API
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Password changed successfully');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Failed to change password');
    }
  };

  const generateApiKey = () => {
    const apiKey = 'nxa_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    setSettings(prev => ({ ...prev, apiKey }));
    toast.success('New API key generated');
  };

  const deleteAccount = () => {
    // In real app, this would show a confirmation dialog and then delete account
    toast.error('Account deletion is not available in demo mode');
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

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center">
                <SettingsIcon className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Settings</h1>
                <p className="text-muted-foreground">Manage your account preferences and configuration</p>
              </div>
            </div>
            
            <Button onClick={handleSave} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            <TabsTrigger value="api">API</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-6">
            <Card className="glass border-border/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-primary" />
                  Appearance
                </CardTitle>
                <CardDescription>
                  Customize how NexaAI looks and feels
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Theme</Label>
                    <Select 
                      value={settings.theme} 
                      onValueChange={(value: 'light' | 'dark' | 'system') => 
                        setSettings(prev => ({ ...prev, theme: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">
                          <div className="flex items-center gap-2">
                            <Sun className="w-4 h-4" />
                            Light
                          </div>
                        </SelectItem>
                        <SelectItem value="dark">
                          <div className="flex items-center gap-2">
                            <Moon className="w-4 h-4" />
                            Dark
                          </div>
                        </SelectItem>
                        <SelectItem value="system">
                          <div className="flex items-center gap-2">
                            <Monitor className="w-4 h-4" />
                            System
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Language</Label>
                    <Select 
                      value={settings.language} 
                      onValueChange={(value) => setSettings(prev => ({ ...prev, language: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="de">Deutsch</SelectItem>
                        <SelectItem value="it">Italiano</SelectItem>
                        <SelectItem value="pt">Português</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-border/20">
              <CardHeader>
                <CardTitle>Content Preferences</CardTitle>
                <CardDescription>
                  Default settings for AI-generated content
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Default Image Style</Label>
                    <Select 
                      value={settings.defaultImageStyle} 
                      onValueChange={(value) => setSettings(prev => ({ ...prev, defaultImageStyle: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="realistic">Realistic</SelectItem>
                        <SelectItem value="artistic">Artistic</SelectItem>
                        <SelectItem value="cartoon">Cartoon</SelectItem>
                        <SelectItem value="abstract">Abstract</SelectItem>
                        <SelectItem value="minimalist">Minimalist</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Default Image Size</Label>
                    <Select 
                      value={settings.defaultImageSize} 
                      onValueChange={(value) => setSettings(prev => ({ ...prev, defaultImageSize: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="512x512">512×512</SelectItem>
                        <SelectItem value="768x768">768×768</SelectItem>
                        <SelectItem value="1024x1024">1024×1024</SelectItem>
                        <SelectItem value="1024x768">1024×768</SelectItem>
                        <SelectItem value="768x1024">768×1024</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Quality Preference</Label>
                    <Select 
                      value={settings.qualityPreference} 
                      onValueChange={(value: 'fast' | 'balanced' | 'quality') => 
                        setSettings(prev => ({ ...prev, qualityPreference: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fast">Fast</SelectItem>
                        <SelectItem value="balanced">Balanced</SelectItem>
                        <SelectItem value="quality">High Quality</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-save generated content</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically save your generated content to history
                    </p>
                  </div>
                  <Switch 
                    checked={settings.autoSave}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, autoSave: checked }))}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="glass border-border/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-primary" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>
                  Choose how you want to be notified about updates and activities
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications about your account activity
                      </p>
                    </div>
                    <Switch 
                      checked={settings.emailNotifications}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, emailNotifications: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive push notifications in your browser
                      </p>
                    </div>
                    <Switch 
                      checked={settings.pushNotifications}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, pushNotifications: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Marketing Emails</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive emails about new features and updates
                      </p>
                    </div>
                    <Switch 
                      checked={settings.marketingEmails}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, marketingEmails: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Weekly Digest</Label>
                      <p className="text-sm text-muted-foreground">
                        Get a weekly summary of your activity
                      </p>
                    </div>
                    <Switch 
                      checked={settings.weeklyDigest}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, weeklyDigest: checked }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy & Security */}
          <TabsContent value="privacy" className="space-y-6">
            <Card className="glass border-border/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Privacy & Security
                </CardTitle>
                <CardDescription>
                  Control your privacy settings and account security
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Profile Visibility</Label>
                      <p className="text-sm text-muted-foreground">
                        Control who can see your profile information
                      </p>
                    </div>
                    <Select 
                      value={settings.profileVisibility} 
                      onValueChange={(value: 'public' | 'private') => 
                        setSettings(prev => ({ ...prev, profileVisibility: value }))
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Data Sharing</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow sharing anonymized usage data to improve services
                      </p>
                    </div>
                    <Switch 
                      checked={settings.dataSharing}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, dataSharing: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Analytics</Label>
                      <p className="text-sm text-muted-foreground">
                        Help improve NexaAI by sharing usage analytics
                      </p>
                    </div>
                    <Switch 
                      checked={settings.analytics}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, analytics: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <Switch 
                      checked={settings.twoFactorAuth}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, twoFactorAuth: checked }))}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Change Password</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input
                        id="new-password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm Password</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                      />
                    </div>
                  </div>
                  <Button 
                    onClick={handlePasswordChange}
                    disabled={!newPassword || !confirmPassword}
                    className="w-full md:w-auto"
                  >
                    Change Password
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* API Settings */}
          <TabsContent value="api" className="space-y-6">
            <Card className="glass border-border/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary" />
                  API & Integrations
                </CardTitle>
                <CardDescription>
                  Manage your API access and integration settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="api-key">API Key</Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          id="api-key"
                          type={showApiKey ? "text" : "password"}
                          value={settings.apiKey || 'No API key generated'}
                          readOnly
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowApiKey(!showApiKey)}
                        >
                          {showApiKey ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <Button onClick={generateApiKey} variant="outline">
                        {settings.apiKey ? 'Regenerate' : 'Generate'}
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Use this API key to access NexaAI services programmatically
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="webhook-url">Webhook URL</Label>
                    <Input
                      id="webhook-url"
                      value={settings.webhookUrl || ''}
                      onChange={(e) => setSettings(prev => ({ ...prev, webhookUrl: e.target.value }))}
                      placeholder="https://your-domain.com/webhook"
                    />
                    <p className="text-sm text-muted-foreground">
                      Receive notifications about completed generations
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Management */}
          <TabsContent value="account" className="space-y-6">
            <Card className="glass border-border/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  Danger Zone
                </CardTitle>
                <CardDescription>
                  Irreversible and destructive actions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border border-destructive/20 rounded-lg p-4 space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-destructive">Delete Account</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Once you delete your account, there is no going back. Please be certain.
                    </p>
                  </div>
                  <Button 
                    variant="destructive" 
                    onClick={deleteAccount}
                    className="w-full md:w-auto"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;