
import React, { useState } from 'react';
import { Moon, Sun, Monitor, Bell } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import DashboardLayout from '@/components/DashboardLayout';
import { useToast } from '@/hooks/use-toast';

const Settings = () => {
  // In a real app, these settings would be persisted to localStorage or a backend service
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light');
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
                Configure how and when you receive notifications.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Telegram Reminders</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive a daily notification at 3:50 PM to submit student count
                  </p>
                </div>
                <Switch
                  checked={telegramNotificationEnabled}
                  onCheckedChange={handleTelegramToggle}
                />
              </div>
              <Separator />
              <div className="flex flex-col gap-2">
                <p className="text-sm text-muted-foreground">
                  <Bell className="inline-block mr-1 h-4 w-4" /> 
                  When enabled, we'll send you a reminder via Telegram each day at 3:50 PM to submit your daily student count.
                </p>
                <p className="text-sm text-muted-foreground italic">
                  Note: You'll need to link your Telegram account with our bot to receive notifications (coming soon).
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
