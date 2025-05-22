"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar as CalendarIconLucide, ArrowLeft, AlertTriangle, ShieldAlert, Wrench, ServerCrash, Construction, CheckCircle } from 'lucide-react'; // Renamed Calendar to avoid conflict, Added CheckCircle
import Link from 'next/link';
import { MaintenanceEventType } from '@prisma/client';
import { format, parseISO } from 'date-fns';

interface MaintenanceEvent {
  id: number;
  title: string;
  description: string | null;
  startDate: string; // ISO string
  endDate: string | null; // ISO string
  type: MaintenanceEventType;
  author?: {
    firstName?: string | null;
    lastName?: string | null;
  };
}

const getEventTypeIcon = (type: MaintenanceEventType) => {
  switch (type) {
    case MaintenanceEventType.PREVENTIVE_MAINTENANCE:
      return <ShieldAlert className="h-5 w-5 text-blue-500 mr-3" />;
    case MaintenanceEventType.REGULAR_UPDATE:
      return <Wrench className="h-5 w-5 text-green-500 mr-3" />;
    case MaintenanceEventType.EMERGENCY_MAINTENANCE:
      return <ServerCrash className="h-5 w-5 text-red-500 mr-3" />;
    case MaintenanceEventType.SERVICE_DEPLOYMENT:
      return <Construction className="h-5 w-5 text-purple-500 mr-3" />;
    default:
      return <CalendarIconLucide className="h-5 w-5 text-gray-500 mr-3" />;
  }
};

export default function ITCalendarPage() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [mounted, setMounted] = React.useState(false);
  const [maintenanceEvents, setMaintenanceEvents] = React.useState<MaintenanceEvent[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setMounted(true);
    if (isLoggedIn) {
      const fetchEvents = async () => {
        setIsLoading(true);
        setError(null);
        try {
          // API endpoint /api/admin/maintenance returns upcoming/active events for non-admins
          const response = await fetch('/api/admin/maintenance');
          if (!response.ok) {
            const errData = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(errData.message || 'Failed to fetch maintenance events');
          }
          const data = await response.json();
          setMaintenanceEvents(Array.isArray(data) ? data : []);
        } catch (err: any) {
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      };
      fetchEvents();
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (mounted && !isLoggedIn) {
      router.push('/login');
    }
  }, [mounted, isLoggedIn, router]);

  if (!mounted) return null;

  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-900">
        <p className="text-lg text-muted-foreground">Redirecting to login...</p>
      </div>
    );
  }

  const upcomingEvents = maintenanceEvents.filter(event => new Date(event.startDate) >= new Date());
  const pastEvents = maintenanceEvents.filter(event => new Date(event.startDate) < new Date()).slice(0, 5); // Show last 5 past events

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center">
            <CalendarIconLucide className="mr-2 h-6 w-6" /> IT Maintenance Calendar
          </h1>
          <Link href="/dashboard" passHref>
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Button>
          </Link>
        </div>

        {isLoading && <p className="text-center text-muted-foreground">Loading maintenance schedule...</p>}
        {error && <p className="text-center text-red-500 py-4"><AlertTriangle className="inline mr-2 h-5 w-5" />Error: {error}</p>}

        {!isLoading && !error && upcomingEvents.length > 0 && (
          <Card className="shadow-lg border border-slate-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle>Upcoming Maintenance</CardTitle>
              <CardDescription>Scheduled IT maintenance and updates.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingEvents.map(event => (
                <div key={event.id} className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-700">
                  <div className="flex items-start">
                    {getEventTypeIcon(event.type)}
                    <div>
                      <h3 className="font-semibold text-blue-800 dark:text-blue-300">{event.title}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {format(parseISO(event.startDate), 'PPPPp')}
                        {event.endDate ? ` - ${format(parseISO(event.endDate), 'PPPPp')}` : ''}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-500 capitalize">
                        Type: {event.type.replace(/_/g, ' ').toLowerCase()}
                      </p>
                      {event.description && <p className="mt-1 text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{event.description}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {!isLoading && !error && upcomingEvents.length === 0 && (
            <Card className="shadow-lg border border-slate-200 dark:border-slate-700">
                <CardContent className="p-6 text-center">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                    <p className="text-lg font-medium text-slate-700 dark:text-slate-300">No Upcoming Maintenance</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">All systems are currently scheduled to operate normally.</p>
                </CardContent>
            </Card>
        )}

        {!isLoading && !error && pastEvents.length > 0 && (
          <Card className="shadow-lg border border-slate-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle>Recent Past Maintenance</CardTitle>
              <CardDescription>A look at recently completed maintenance activities.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {pastEvents.map(event => (
                <div key={event.id} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 opacity-75">
                  <div className="flex items-start">
                    {getEventTypeIcon(event.type)}
                    <div>
                      <h3 className="font-medium text-slate-700 dark:text-slate-300">{event.title}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {format(parseISO(event.startDate), 'MMM d, yyyy, h:mm a')}
                        {event.endDate ? ` to ${format(parseISO(event.endDate), 'h:mm a')}` : ''}
                      </p>
                       <p className="text-xs text-slate-500 dark:text-slate-500 capitalize">
                        Type: {event.type.replace(/_/g, ' ').toLowerCase()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <Card className="shadow-lg border border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle>Maintenance Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
              <li className="flex items-start">
                <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mt-1.5 mr-2"></span>
                <span>Details for scheduled maintenance will appear above.</span>
              </li>
              <li className="flex items-start">
                <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mt-1.5 mr-2"></span>
                <span>Emergency maintenance may be scheduled as needed and will be communicated promptly.</span>
              </li>
              <li className="flex items-start">
                <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mt-1.5 mr-2"></span>
                <span>For questions about the maintenance schedule, please contact the IT department.</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}