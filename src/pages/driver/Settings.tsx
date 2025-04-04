import React, { useState } from 'react';
import { Moon, Sun, Monitor, Bell } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import DashboardLayout from '@/components/DashboardLayout';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/components/theme-provider';

const Settings = () => {
  // Theme is now managed by the ThemeProvider
  const { theme, setTheme } = useTheme();
  const [telegramNotificationEnabled, setTelegramNotificationEnabled] = useState(false);
  const { toast } = useToast();

  const handleTelegramToggle = (checked: boolean) => {
    setTelegramNotificationEnabled(checked);
    
    if (checked) {
      toast({
        title: "Notifications Enabled",
        description: "You will now receive Telegram notifications at 3:50 PM for student count submission.",
      });
    } else {
      toast({
        title: "Notifications Disabled",
        description: "You will no longer receive Telegram notifications.",
      });
    }
  };

  return (
    <DashboardLayout title="Settings" role="driver" currentPath="/driver/settings">
      <div className="container mx-auto py-6 max-w-4xl">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize how the application looks on your device.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">Theme</h3>
                  <p className="text-sm text-muted-foreground">
                    Select your preferred theme for the application.
                  </p>
                </div>
                <RadioGroup
                  value={theme}
                  onValueChange={(value) => setTheme(value as 'light' | 'dark' | 'system')}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="light" id="theme-light" />
                    <Label
                      htmlFor="theme-light"
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Sun className="h-5 w-5" /> Light
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="dark" id="theme-dark" />
                    <Label
                      htmlFor="theme-dark"
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Moon className="h-5 w-5" /> Dark
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="system" id="theme-system" />
                    <Label
                      htmlFor="theme-system"
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Monitor className="h-5 w-5" /> System
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Configure your notification preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">Telegram Notifications</h3>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications on Telegram when it's time to submit student counts.
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="telegram-notifications" 
                    checked={telegramNotificationEnabled}
                    onCheckedChange={handleTelegramToggle}
                  />
                  <Label htmlFor="telegram-notifications">
                    Daily reminder at 3:50 PM
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
