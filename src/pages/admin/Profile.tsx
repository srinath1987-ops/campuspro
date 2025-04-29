import React, { useState, useEffect } from 'react';
import { User, Lock, Phone, AtSign, Save, Upload } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const Profile = () => {
  const { profile, updateProfile, updatePassword } = useAuth();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phoneNumber, setPhoneNumber] = useState(profile?.phone_number || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile?.avatar_url || null);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setPhoneNumber(profile.phone_number || '');
      setAvatarUrl(profile.avatar_url || null);
    }
  }, [profile]);

  if (!profile) {
    return (
      <DashboardLayout title="Admin Profile" role="admin" currentPath="/admin/profile">
        <div className="flex justify-center items-center h-[60vh]">
          <Alert className="max-w-md">
            <AlertDescription>
              Unable to load profile information. Please try refreshing the page.
            </AlertDescription>
          </Alert>
        </div>
      </DashboardLayout>
    );
  }

  const handleProfileUpdate = async () => {
    if (!fullName.trim() || !phoneNumber.trim()) {
      toast({
        title: "Missing Information",
        description: "Full name and phone number are required.",
        variant: "destructive"
      });
      return;
    }

    setIsUpdating(true);
    try {
      await updateProfile({
        full_name: fullName,
        phone_number: phoneNumber,
        avatar_url: avatarUrl
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords Do Not Match",
        description: "New password and confirmation password must match.",
        variant: "destructive"
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive"
      });
      return;
    }

    setIsUpdating(true);
    try {
      await updatePassword(newPassword);
      
      // Reset the form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordDialogOpen(false);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }

    try {
      setIsUploading(true);
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `avatars/${profile.id}-${Math.random()}.${fileExt}`;

      // First check if the bucket exists, if not create it
      try {
        const { data: buckets } = await supabase.storage.listBuckets();
        const profilesBucketExists = buckets?.some(bucket => bucket.name === 'profiles');
        
        if (!profilesBucketExists) {
          // Create the bucket if it doesn't exist
          const { error: createBucketError } = await supabase.storage.createBucket('profiles', {
            public: true,
            fileSizeLimit: 5242880 // 5MB
          });
          
          if (createBucketError) {
            console.error("Error creating bucket:", createBucketError);
            throw createBucketError;
          }
        }
      } catch (bucketError) {
        console.error("Error checking/creating bucket:", bucketError);
      }

      // Upload the file to Supabase storage
      const { error: uploadError, data } = await supabase.storage
        .from('profiles')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);

      // Update profile with new avatar URL
      const newAvatarUrl = urlData.publicUrl;
      setAvatarUrl(newAvatarUrl);

      // Update the profile in the database using Supabase directly
      // Check if avatar_url column exists in profiles table
      try {
        // First, try to get the profile to confirm the schema
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', profile.id)
          .single();

        if (profileError) {
          console.error("Error fetching profile schema:", profileError);
        }

        // Now attempt the update with the avatar_url field
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ avatar_url: newAvatarUrl })
          .eq('id', profile.id);

        if (updateError) {
          console.error("Error updating profile with avatar_url:", updateError);
          
          // If there was an error updating, try using the updateProfile function 
          // from the AuthContext as a fallback
          await updateProfile({
            avatar_url: newAvatarUrl
          });
        }
      } catch (error) {
        console.error("Error during profile update:", error);
        toast({
          title: "Update Failed",
          description: "There was an error updating your profile. Please try again.",
          variant: "destructive"
        });
      }

      toast({
        title: "Profile Picture Updated",
        description: "Your profile picture has been updated successfully."
      });
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload profile picture.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <DashboardLayout title="Admin Profile" role="admin" currentPath="/admin/profile">
      <div className="container mx-auto py-6 max-w-4xl">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Profile Information</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your personal information and profile settings.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Profile image upload */}
                  <div className="flex flex-col items-center space-y-4">
                    <div className="rounded-full relative w-32 h-32 overflow-hidden">
                      {avatarUrl ? (
                        <Avatar className="w-32 h-32">
                          <AvatarImage src={avatarUrl} alt={fullName} />
                          <AvatarFallback className="bus-gradient-bg text-white text-2xl">
                            {fullName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="bus-gradient-bg w-32 h-32 rounded-full flex items-center justify-center">
                          <User className="h-16 w-16 text-white" />
                        </div>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="avatar-upload" className="cursor-pointer">
                        <div className="flex items-center gap-2 p-2 border rounded-md hover:bg-secondary">
                          <Upload className="h-4 w-4" />
                          <span>{isUploading ? "Uploading..." : "Upload Image"}</span>
                        </div>
                        <Input 
                          id="avatar-upload" 
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          disabled={isUploading}
                        />
                      </Label>
                    </div>
                  </div>
                  
                  {/* Rest of profile form */}
                  <div className="flex-1 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <div className="flex">
                        <div className="bg-muted p-2 rounded-l-md flex items-center border border-r-0 border-input">
                          <User className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <Input
                          id="fullName"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="rounded-l-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <div className="flex">
                        <div className="bg-muted p-2 rounded-l-md flex items-center border border-r-0 border-input">
                          <AtSign className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <Input
                          id="email"
                          value={profile.email || ''}
                          disabled
                          className="rounded-l-none bg-muted"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Email address cannot be changed.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="flex">
                        <div className="bg-muted p-2 rounded-l-md flex items-center border border-r-0 border-input">
                          <Phone className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <Input
                          id="phone"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          className="rounded-l-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Input
                        id="role"
                        value={profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                        disabled
                        className="bg-muted"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="justify-end">
                <Button
                  disabled={isUpdating}
                  onClick={handleProfileUpdate}
                >
                  {isUpdating ? (
                    <>Saving...</>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Update your password and security preferences.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Password</h3>
                  <p className="text-sm text-muted-foreground">
                    Change your password to something you can remember but others can't guess.
                  </p>
                  <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="mt-2">
                        <Lock className="mr-2 h-4 w-4" />
                        Change Password
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Change Password</DialogTitle>
                        <DialogDescription>
                          Enter a new password for your account.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="new-password">New Password</Label>
                          <Input
                            id="new-password"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="col-span-3"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirm-password">Confirm New Password</Label>
                          <Input
                            id="confirm-password"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="col-span-3"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setPasswordDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button 
                          onClick={handlePasswordUpdate}
                          disabled={isUpdating}
                        >
                          {isUpdating ? "Updating..." : "Update Password"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
