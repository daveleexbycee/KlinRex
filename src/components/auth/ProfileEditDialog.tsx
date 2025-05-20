
// src/components/auth/ProfileEditDialog.tsx
"use client";

import React, { useState, useEffect, type ChangeEvent } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth, type UserProfileUpdateData, type KlinRexUser } from '@/contexts/auth-context';
import { Loader2, UserCircle2, Edit3, UploadCloud } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';


const profileEditSchema = z.object({
  displayName: z.string().min(1, "Display name cannot be empty.").max(50, "Display name is too long."),
  bloodGroup: z.string().optional(),
  bloodType: z.string().optional(),
  emergencyContact: z.string().optional().refine(val => !val || /^[+]?[0-9\s\-()]*$/.test(val), {
    message: "Invalid phone number format.",
  }),
  address: z.string().optional(),
});

type ProfileEditFormValues = z.infer<typeof profileEditSchema>;

interface ProfileEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BLOOD_GROUPS = ["A", "B", "AB", "O", "Unknown"];
const BLOOD_TYPES = ["Positive", "Negative", "Unknown"]; // Will map to Rh+ / Rh-

export function ProfileEditDialog({ open, onOpenChange }: ProfileEditDialogProps) {
  const { user, updateUserProfile, loading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const form = useForm<ProfileEditFormValues>({
    resolver: zodResolver(profileEditSchema),
    defaultValues: {
      displayName: '',
      bloodGroup: '',
      bloodType: '',
      emergencyContact: '',
      address: '',
    },
  });

  useEffect(() => {
    if (open && user) {
      form.reset({
        displayName: user.displayName || '',
        bloodGroup: user.bloodGroup || '',
        bloodType: user.bloodType || '',
        emergencyContact: user.emergencyContact || '',
        address: user.address || '',
      });
      setPreviewUrl(user.photoURL);
    }
    if (!open) {
      setSelectedFile(null);
      setPreviewUrl(user?.photoURL || null);
      form.reset({ // Reset to initial/user values when dialog closes
        displayName: user?.displayName || '',
        bloodGroup: user?.bloodGroup || '',
        bloodType: user?.bloodType || '',
        emergencyContact: user?.emergencyContact || '',
        address: user?.address || '',
      });
    }
  }, [user, form, open]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit: SubmitHandler<ProfileEditFormValues> = async (data) => {
    setIsLoading(true);
    const updateData: UserProfileUpdateData = {
      displayName: data.displayName,
      bloodGroup: data.bloodGroup || undefined, // Send undefined if empty to potentially clear
      bloodType: data.bloodType || undefined,
      emergencyContact: data.emergencyContact || undefined,
      address: data.address || undefined,
    };
    if (selectedFile) {
      updateData.photoFile = selectedFile;
    }

    const success = await updateUserProfile(updateData);
    setIsLoading(false);
    if (success) {
      onOpenChange(false);
    }
  };

  const effectiveLoading = isLoading || authLoading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Edit3 className="mr-2 h-5 w-5" /> Edit Profile
          </DialogTitle>
          <DialogDescription>Update your display name, photo, and other personal details.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <ScrollArea className="max-h-[calc(100vh-200px)] p-1 pr-6"> {/* Added ScrollArea */}
              <div className="space-y-4">
                <div className="flex flex-col items-center space-y-3">
                  <Avatar className="h-24 w-24 ring-2 ring-primary ring-offset-2 ring-offset-background">
                    {previewUrl ? (
                      <AvatarImage src={previewUrl} alt="Profile preview" data-ai-hint="profile avatar"/>
                    ) : user?.photoURL ? (
                      <AvatarImage src={user.photoURL} alt={user.displayName || 'User Avatar'} data-ai-hint="user avatar"/>
                    ) : (
                      <AvatarFallback className="text-3xl">
                        {user?.displayName ? user.displayName.charAt(0).toUpperCase() : <UserCircle2 />}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <FormField
                    control={form.control}
                    name="photo" // Not part of schema, just for the input
                    render={() => (
                      <FormItem>
                        <FormLabel
                          htmlFor="photo-upload"
                          className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                        >
                          <UploadCloud className="mr-2 h-4 w-4" />
                          Change Picture
                        </FormLabel>
                        <FormControl>
                          <Input
                            id="photo-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileChange}
                            disabled={effectiveLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your Name" {...field} disabled={effectiveLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="bloodGroup"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Blood Group</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={effectiveLoading}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select blood group" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {BLOOD_GROUPS.map(group => (
                              <SelectItem key={group} value={group}>{group}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="bloodType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Blood Type (Rh Factor)</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={effectiveLoading}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Rh factor" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {BLOOD_TYPES.map(type => (
                              <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="emergencyContact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Emergency Contact</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="e.g., +1 555-123-4567" {...field} disabled={effectiveLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Textarea placeholder="123 Main St, Anytown, USA" {...field} disabled={effectiveLoading} className="min-h-[80px]" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </ScrollArea>
            <DialogFooter className="sm:justify-between pt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={effectiveLoading}>
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={effectiveLoading}>
                {effectiveLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
