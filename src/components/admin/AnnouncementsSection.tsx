"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { PlusCircle, Edit3, Trash2, Megaphone } from 'lucide-react';

interface Announcement {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string | null;
  isActive: boolean;
  authorId?: number | null;
  author?: {
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
  } | null;
}

interface AnnouncementsSectionProps {
  // Add any necessary props, e.g., for API interaction if not handled internally
}

const AnnouncementsSection: React.FC<AnnouncementsSectionProps> = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoadingAnnouncements, setIsLoadingAnnouncements] = useState(true);
  const [announcementsError, setAnnouncementsError] = useState<string | null>(null);
  const [showAnnouncementDialog, setShowAnnouncementDialog] = useState(false);
  const [currentAnnouncement, setCurrentAnnouncement] = useState<Announcement | null>(null);
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementContent, setAnnouncementContent] = useState('');
  const [announcementIsActive, setAnnouncementIsActive] = useState(true);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setIsLoadingAnnouncements(true);
    setAnnouncementsError(null);
    try {
      const response = await fetch('/api/admin/announcements');
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || `Failed to fetch announcements: ${response.statusText}`);
      }
      const data = await response.json();
      setAnnouncements(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("Error fetching announcements:", err);
      setAnnouncementsError(err.message || 'Failed to load announcements.');
    } finally {
      setIsLoadingAnnouncements(false);
    }
  };

  const handleSaveAnnouncement = async () => {
    setIsLoadingAnnouncements(true);
    const apiUrl = currentAnnouncement
      ? `/api/admin/announcements/${currentAnnouncement.id}`
      : '/api/admin/announcements';
    const method = currentAnnouncement ? 'PUT' : 'POST';

    const payload = {
      title: announcementTitle,
      content: announcementContent,
      isActive: announcementIsActive,
    };

    try {
      const response = await fetch(apiUrl, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Failed to ${method === 'POST' ? 'create' : 'update'} announcement` }));
        throw new Error(errorData.message || `API error: ${response.statusText}`);
      }
      
      setShowAnnouncementDialog(false);
      setCurrentAnnouncement(null);
      setAnnouncementTitle('');
      setAnnouncementContent('');
      setAnnouncementIsActive(true);
      fetchAnnouncements();
    } catch (error: any) {
      console.error(`Error saving announcement:`, error);
      setAnnouncementsError(error.message || 'Could not save announcement.');
    } finally {
      setIsLoadingAnnouncements(false);
    }
  };

  const handleEditAnnouncement = (ann: Announcement) => {
    setCurrentAnnouncement(ann);
    setAnnouncementTitle(ann.title);
    setAnnouncementContent(ann.content);
    setAnnouncementIsActive(ann.isActive);
    setShowAnnouncementDialog(true);
  };

  const handleDeleteAnnouncement = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) {
      return;
    }
    setIsLoadingAnnouncements(true);
    try {
      const response = await fetch(`/api/admin/announcements/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to delete announcement' }));
        throw new Error(errorData.message || `API error: ${response.statusText}`);
      }
      fetchAnnouncements();
    } catch (error: any) {
      console.error(`Error deleting announcement ${id}:`, error);
      setAnnouncementsError(error.message || 'Could not delete announcement.');
    } finally {
      setIsLoadingAnnouncements(false);
    }
  };

  const openNewAnnouncementDialog = () => {
    setCurrentAnnouncement(null);
    setAnnouncementTitle('');
    setAnnouncementContent('');
    setAnnouncementIsActive(true);
    setShowAnnouncementDialog(true);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center">
            <Megaphone className="h-5 w-5 text-red-600 mr-2" />
            IT Announcements
          </CardTitle>
          <Button onClick={openNewAnnouncementDialog} size="sm">
            <PlusCircle className="mr-2 h-4 w-4" /> Add New
          </Button>
        </div>
        {announcementsError && <p className="text-sm text-red-500 mt-2">{announcementsError}</p>}
      </CardHeader>
      <CardContent>
        {isLoadingAnnouncements ? (
          <p className="text-muted-foreground">Loading announcements...</p>
        ) : announcements.length === 0 ? (
          <p className="text-muted-foreground">No announcements yet.</p>
        ) : (
          <div className="space-y-4">
            {announcements.map((ann) => (
              <div key={ann.id} className="p-3 border rounded-md bg-slate-50 dark:bg-slate-800/50">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold">{ann.title}</h4>
                    <p className="text-xs text-muted-foreground">
                      Created: {new Date(ann.createdAt).toLocaleDateString()}
                      {ann.isActive ? (
                        <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full dark:bg-green-900/30 dark:text-green-300">Active</span>
                      ) : (
                        <span className="ml-2 px-2 py-0.5 text-xs bg-red-100 text-red-800 rounded-full dark:bg-red-900/30 dark:text-red-300">Inactive</span>
                      )}
                    </p>
                  </div>
                  <div className="space-x-2 flex-shrink-0">
                    <Button variant="outline" size="icon" onClick={() => handleEditAnnouncement(ann)}>
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="icon" onClick={() => handleDeleteAnnouncement(ann.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm mt-2">{ann.content}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={showAnnouncementDialog} onOpenChange={(isOpen) => {
          setShowAnnouncementDialog(isOpen);
          if (!isOpen) {
            setCurrentAnnouncement(null);
            setAnnouncementTitle('');
            setAnnouncementContent('');
            setAnnouncementIsActive(true);
          }
        }}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>{currentAnnouncement ? 'Edit' : 'Create'} Announcement</DialogTitle>
            <DialogDescription>
              {currentAnnouncement ? 'Update the details of the announcement.' : 'Fill in the details for the new announcement.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="ann-title" className="text-right">
                Title
              </Label>
              <Input
                id="ann-title"
                value={announcementTitle}
                onChange={(e) => setAnnouncementTitle(e.target.value)}
                className="col-span-3"
                placeholder="Announcement Title"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="ann-content" className="text-right">
                Content
              </Label>
              <Textarea
                id="ann-content"
                value={announcementContent}
                onChange={(e) => setAnnouncementContent(e.target.value)}
                className="col-span-3 min-h-[100px]"
                placeholder="Announcement Content"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="ann-active" className="text-right">
                Active
              </Label>
              <Switch
                id="ann-active"
                checked={announcementIsActive}
                onCheckedChange={setAnnouncementIsActive}
                className="col-span-3 justify-self-start"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSaveAnnouncement} disabled={isLoadingAnnouncements}>
              {isLoadingAnnouncements ? 'Saving...' : (currentAnnouncement ? 'Save Changes' : 'Create Announcement')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default AnnouncementsSection;