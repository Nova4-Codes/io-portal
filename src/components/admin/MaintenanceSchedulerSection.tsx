"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { CalendarIcon, PlusCircle, Edit2, Trash2, AlertTriangle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { MaintenanceEventType } from '@prisma/client'; // Assuming prisma client is generated and available

interface MaintenanceEvent {
  id: number;
  title: string;
  description: string | null;
  startDate: string; // ISO string
  endDate: string | null; // ISO string
  type: MaintenanceEventType;
  authorId: number;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  author?: {
    firstName?: string | null;
    lastName?: string | null;
  };
}

const MaintenanceSchedulerSection: React.FC = () => {
  const [events, setEvents] = useState<MaintenanceEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<Partial<MaintenanceEvent> | null>(null); // For create/edit
  const [isEditMode, setIsEditMode] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [type, setType] = useState<MaintenanceEventType>(MaintenanceEventType.REGULAR_UPDATE);

  const [eventToDelete, setEventToDelete] = useState<MaintenanceEvent | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/maintenance');
      if (!response.ok) {
        const errData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errData.message || 'Failed to fetch maintenance events');
      }
      const data = await response.json();
      setEvents(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setStartDate(undefined);
    setEndDate(undefined);
    setType(MaintenanceEventType.REGULAR_UPDATE);
    setCurrentEvent(null);
    setIsEditMode(false);
  };

  const handleOpenCreateForm = () => {
    resetForm();
    setIsEditMode(false);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (event: MaintenanceEvent) => {
    resetForm();
    setCurrentEvent(event);
    setIsEditMode(true);
    setTitle(event.title);
    setDescription(event.description || '');
    setStartDate(event.startDate ? parseISO(event.startDate) : undefined);
    setEndDate(event.endDate ? parseISO(event.endDate) : undefined);
    setType(event.type);
    setIsFormOpen(true);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate) {
        alert("Start date is required."); // Simple validation for now
        return;
    }

    const payload = {
      title,
      description: description || null,
      startDate: startDate.toISOString(),
      endDate: endDate ? endDate.toISOString() : null,
      type,
    };

    const url = isEditMode && currentEvent?.id ? `/api/admin/maintenance/${currentEvent.id}` : '/api/admin/maintenance';
    const method = isEditMode ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${isEditMode ? 'update' : 'create'} event`);
      }
      
      await fetchEvents(); // Refresh list
      setIsFormOpen(false);
      resetForm();

    } catch (err: any) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} event:`, err);
      alert(`Error: ${err.message}`); // Show error to user
    }
  };

  const handleDelete = async () => {
    if (!eventToDelete) return;
    try {
      const response = await fetch(`/api/admin/maintenance/${eventToDelete.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete event');
      }
      await fetchEvents(); // Refresh list
    } catch (err: any) {
      console.error('Error deleting event:', err);
      alert(`Error deleting event: ${err.message}`);
    } finally {
      setIsDeleteDialogOpen(false);
      setEventToDelete(null);
    }
  };


  return (
    <section className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <div>
            <CardTitle>Maintenance Schedule Management</CardTitle>
            <CardDescription>Create, view, and manage IT maintenance events.</CardDescription>
          </div>
          <Button onClick={handleOpenCreateForm}>
            <PlusCircle className="mr-2 h-4 w-4" /> Create New Event
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading && <p className="text-center text-muted-foreground">Loading events...</p>}
          {error && <p className="text-center text-red-500 py-4"><AlertTriangle className="inline mr-2 h-5 w-5" />Error: {error}</p>}
          {!isLoading && !error && events.length === 0 && (
            <p className="text-center text-muted-foreground py-4">No maintenance events scheduled yet.</p>
          )}
          {!isLoading && !error && events.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead className="text-right w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">{event.title}</TableCell>
                    <TableCell><span className="capitalize">{event.type.replace(/_/g, ' ').toLowerCase()}</span></TableCell>
                    <TableCell>{format(parseISO(event.startDate), 'PPpp')}</TableCell>
                    <TableCell>{event.endDate ? format(parseISO(event.endDate), 'PPpp') : 'N/A'}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenEditForm(event)} className="mr-1">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => { setEventToDelete(event); setIsDeleteDialogOpen(true); }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Form Dialog for Create/Edit */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent
          className="sm:max-w-lg"
          onPointerDownOutside={(e) => {
            // Check if the target is within a popover, if so, prevent default.
            // This is a common pattern to allow interaction with popovers inside dialogs.
            const target = e.target as HTMLElement;
            if (target.closest('[data-radix-popper-content-wrapper]')) {
              e.preventDefault();
            }
          }}
        >
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit' : 'Create New'} Maintenance Event</DialogTitle>
            <DialogDescription>
              {isEditMode ? 'Update the details of the maintenance event.' : 'Fill in the details for the new maintenance event.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="startDate">Start Date & Time</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={`w-full justify-start text-left font-normal ${!startDate && "text-muted-foreground"}`}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {startDate ? format(startDate, "PPP HH:mm") : <span>Pick a date & time</span>}
                        </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 z-[51]">
                        <Calendar
                            mode="single"
                            selected={startDate}
                            onSelect={setStartDate}
                        />
                        <div className="p-2 border-t border-border">
                            <Input
                              type="time"
                              value={startDate ? format(startDate, "HH:mm") : ""}
                              onChange={(e) => {
                                const time = e.target.value.split(':');
                                if (time.length === 2) {
                                    const hours = parseInt(time[0]);
                                    const minutes = parseInt(time[1]);
                                    const newFullDate = startDate ? new Date(startDate) : new Date(); // Use current date or today
                                    newFullDate.setHours(hours, minutes, 0, 0);
                                    setStartDate(newFullDate);
                                }
                            }}/>
                        </div>
                        </PopoverContent>
                    </Popover>
                </div>
                <div>
                    <Label htmlFor="endDate">End Date & Time (Optional)</Label>
                     <Popover>
                        <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={`w-full justify-start text-left font-normal ${!endDate && "text-muted-foreground"}`}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {endDate ? format(endDate, "PPP HH:mm") : <span>Pick a date & time</span>}
                        </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 z-[51]">
                        <Calendar
                            mode="single"
                            selected={endDate}
                            onSelect={setEndDate}
                        />
                        <div className="p-2 border-t border-border">
                             <Input
                                type="time"
                                value={endDate ? format(endDate, "HH:mm") : ""}
                                onChange={(e) => {
                                    const time = e.target.value.split(':');
                                    if (time.length === 2) {
                                        const hours = parseInt(time[0]);
                                        const minutes = parseInt(time[1]);
                                        const newFullDate = endDate ? new Date(endDate) : new Date(); // Use current date or today
                                        newFullDate.setHours(hours, minutes, 0, 0);
                                        setEndDate(newFullDate);
                                    }
                                }}/>
                        </div>
                        </PopoverContent>
                    </Popover>
                </div>
            </div>
            <div>
              <Label htmlFor="type">Type</Label>
              <Select value={type} onValueChange={(value) => setType(value as MaintenanceEventType)}>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select maintenance type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(MaintenanceEventType).map((enumValue) => (
                    <SelectItem key={enumValue} value={enumValue}>
                      {enumValue.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
              </DialogClose>
              <Button type="submit">{isEditMode ? 'Save Changes' : 'Create Event'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the maintenance event:
              <strong className="block mt-2">{eventToDelete?.title}</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setEventToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Yes, delete event
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
};

export default MaintenanceSchedulerSection;