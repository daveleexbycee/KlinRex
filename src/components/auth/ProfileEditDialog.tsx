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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth, type UserProfileUpdateData } from '@/contexts/auth-context';
import { Loader2, UserCircle2, Edit3, UploadCloud } from 'lucide-react';
import Image from 'next/image';

const profileEditSchema = z.object({
  displayName: z.string().min(1, "Display name cannot be empty.").max(50, "Display name is too long."),
});

type ProfileEditFormValues = z.infer<typeof profileEditSchema>;

interface ProfileEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileEditDialog({ open, onOpenChange }: ProfileEditDialogProps) {
  const { user, updateUserProfile, loading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const form = useForm<ProfileEditFormValues>({
    resolver: zodResolver(profileEditSchema),
    defaultValues: {
      displayName: user?.displayName || '',
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({ displayName: user.displayName || '' });
      setPreviewUrl(user.photoURL); // Initialize preview with current photoURL
    }
    if (!open) { // Reset file selection when dialog closes
        setSelectedFile(null);
        setPreviewUrl(user?.photoURL || null);
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Edit3 className="mr-2 h-5 w-5" /> Edit Profile
          </DialogTitle>
          <DialogDescription>Update your display name and profile picture.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-24 w-24 ring-2 ring-primary ring-offset-2 ring-offset-background">
                {previewUrl ? (
                  <AvatarImage src={previewUrl} alt="Profile preview" data-ai-hint="profile avatar" />
                ) : user?.photoURL ? (
                  <AvatarImage src={user.photoURL} alt={user.displayName || 'User Avatar'} data-ai-hint="user avatar" />
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
