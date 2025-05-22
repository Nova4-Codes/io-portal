"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  LogOut,
  UserCircle,
  ListChecks,
  ShieldCheck,
  LifeBuoy,
  Link as LinkIcon,
  Zap,
  BookOpen,
  ArrowRight,
  Globe,
  Bell,
  Calendar,
  FileText,
  Settings,
  Search,
  HardDrive,
  BarChart3,
  Megaphone,
  CalendarDays // Added for Maintenance Schedule
} from 'lucide-react';
import { allToolDetails, itFacts } from '@/data/dashboardConstants'; 
import Link from 'next/link'; 

// --- Reverted State ---

export default function DashboardPage() {
  const router = useRouter();
  const { 
    isLoggedIn, 
    firstName, 
    lastName,
    userRole,
    agreedPolicies, 
    completedTools, 
    logout
  } = useAuth();

  const [randomFact, setRandomFact] = React.useState('');
  const [mounted, setMounted] = React.useState(false);
  const [generalAnnouncements, setGeneralAnnouncements] = React.useState<any[]>([]);
  const [maintenanceSchedules, setMaintenanceSchedules] = React.useState<any[]>([]);
  const [isLoadingAnnouncements, setIsLoadingAnnouncements] = React.useState(true);
  const [announcementsError, setAnnouncementsError] = React.useState<string | null>(null);

  const MAINTENANCE_PREFIX = "MAINTENANCE:";

  // Effect to set mounted to true after initial render
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Effect for setting random fact, only if mounted and logged in
  useEffect(() => {
    // Check itFacts has items before trying to access length/index
    if (mounted && isLoggedIn && itFacts && itFacts.length > 0) { 
      setRandomFact(itFacts[Math.floor(Math.random() * itFacts.length)]);
    }
  }, [mounted, isLoggedIn]);

  // Effect for fetching announcements
  React.useEffect(() => {
    const fetchAnnouncements = async () => {
      if (mounted && isLoggedIn) {
        setIsLoadingAnnouncements(true);
        setAnnouncementsError(null);
        try {
          // The GET /api/admin/announcements route handles returning public announcements
          const response = await fetch('/api/admin/announcements');
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(errorData.message || `Failed to fetch announcements: ${response.statusText}`);
          }
          const data = await response.json();
          if (Array.isArray(data)) {
            const maintSchedules: any[] = [];
            const genAnnouncements: any[] = [];
            data.forEach(ann => {
              if (ann.title && ann.title.toUpperCase().startsWith(MAINTENANCE_PREFIX)) {
                maintSchedules.push({
                  ...ann,
                  // Remove prefix for display if desired, or keep it
                  // title: ann.title.substring(MAINTENANCE_PREFIX.length).trim()
                });
              } else {
                genAnnouncements.push(ann);
              }
            });
            setMaintenanceSchedules(maintSchedules);
            setGeneralAnnouncements(genAnnouncements);
          } else {
            setMaintenanceSchedules([]);
            setGeneralAnnouncements([]);
          }
        } catch (err: any) {
          console.error("Error fetching announcements for dashboard:", err);
          setAnnouncementsError(err.message || 'Could not load announcements.');
        } finally {
          setIsLoadingAnnouncements(false);
        }
      }
    };
    fetchAnnouncements();
  }, [mounted, isLoggedIn]);

  // Effect for redirecting if not logged in, only if mounted
  React.useEffect(() => {
    if (mounted && !isLoggedIn) {
      router.push('/login');
    }
  }, [mounted, isLoggedIn, router]);

  // If not yet mounted, return null to avoid hydration mismatch
  if (!mounted) {
    return null; 
  }

  // If mounted but not logged in, show redirecting message
  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-900">
        <p className="text-lg text-muted-foreground">Redirecting to login...</p>
      </div>
    );
  }
  
  // --- Logic for logged-in state ---
  const displayName = `${firstName} ${lastName}`;
  const displayRole = userRole;

  // Only need completed tools details now
  const completedToolsDetails = allToolDetails.filter(t => completedTools.includes(t.id));

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-0">
      <div className="max-w-4xl mx-auto space-y-1">
        
        {/* Header Section - Simple and compact */}
        <header className="bg-white dark:bg-slate-800 rounded-lg shadow-sm">
          
          {/* Top Bar with Logo and Logout */}
          <div className="p-1 flex justify-between items-center">
            <div className="text-xs font-medium text-blue-600">
              INUA AI SOLUTIONS LTD.
            </div>
            
            <Button
              variant="ghost"
              onClick={handleLogout}
              size="sm"
            >
              <LogOut className="mr-1 h-4 w-4" /> Logout
            </Button>
          </div>
        </header>

        {/* Welcome Banner with Support Links */}
        <div className="bg-white dark:bg-slate-800 p-1 rounded-lg shadow-sm border-l-4 border-red-500">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
            <div>
              <h1 className="text-lg font-medium">
                Welcome, {displayName}!
              </h1>
              <p className="text-sm text-slate-500">
                <span className="text-sm text-red-600 mr-2">{displayRole || 'EMPLOYEE'}</span>
                Last login: {new Date().toLocaleDateString()}
              </p>
            </div>
            
            <div className="flex mt-1 sm:mt-0 space-x-3">
              <a href="http://help.inuaai.net" target="_blank" rel="noopener noreferrer" className="flex items-center text-sm text-blue-600 hover:underline">
                <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center mr-1">
                  <LinkIcon className="h-2 w-2 text-blue-600" />
                </div>
                Help
              </a>
              <a href="mailto:ITSUPPORTDESK@INUAAI.COM" className="flex items-center text-sm text-blue-600 hover:underline">
                <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center mr-1">
                  <UserCircle className="h-2 w-2 text-blue-600" />
                </div>
                Support
              </a>
              <a href="https://inuaai.com/" target="_blank" rel="noopener noreferrer" className="flex items-center text-sm text-blue-600 hover:underline">
                <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center mr-1">
                  <Globe className="h-2 w-2 text-blue-600" />
                </div>
                Website
              </a>
            </div>
          </div>
        </div>
        {/* Main Content Area */}
        <main className="space-y-2">

          {/* Upcoming Maintenance Section */}
          {!isLoadingAnnouncements && !announcementsError && maintenanceSchedules.length > 0 && (
            <Card className="border-orange-500 border-l-4 dark:border-orange-400">
              <CardHeader className="pb-2 pt-3 px-3">
                <div className="flex items-center">
                  <CalendarDays className="h-5 w-5 text-orange-600 dark:text-orange-400 mr-2" />
                  <CardTitle className="text-base font-semibold text-orange-700 dark:text-orange-300">Upcoming Maintenance</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="px-3 pb-3 space-y-2">
                {maintenanceSchedules.slice(0, 2).map((schedule, index) => ( // Display latest 2 maintenance schedules
                  <div key={schedule.id || index} className={index < maintenanceSchedules.slice(0,2).length -1 ? "border-b border-slate-200 dark:border-slate-700 pb-2 mb-2" : ""}>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{schedule.title.replace(MAINTENANCE_PREFIX, "").trim()}</p>
                    {schedule.createdAt && ( // Or a specific maintenance date field if you add one
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Announced: {new Date(schedule.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    )}
                    <p className="text-sm mt-0.5 text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{schedule.content}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Quick Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
            <div className="bg-white dark:bg-slate-800 p-1 rounded-lg shadow-sm flex items-center">
              <div className="mr-3">
                <Calendar className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">System Updates</p>
                <p className="text-base font-medium">Every Monday</p>
                <p className="text-sm text-slate-500">Next: {new Date(new Date().setDate(new Date().getDate() + (1 + 7 - new Date().getDay()) % 7)).toLocaleDateString()}</p>
              </div>
            </div>
            
            <div className="bg-white dark:bg-slate-800 p-1 rounded-lg shadow-sm flex items-center">
              <div className="mr-3">
                <BarChart3 className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">IT Tickets</p>
                <p className="text-base font-medium">0 Active</p>
                <p className="text-sm text-slate-500">2 resolved this month</p>
              </div>
            </div>
          </div>

          {/* Quick Actions Section */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm">
            <div className="p-1 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-base font-medium">Quick Actions</h2>
            </div>
            <div className="p-1">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
                <Link href="/policy-center" passHref>
                  <Button variant="outline" className="h-auto py-3 flex flex-col items-center justify-center w-full gap-1">
                    <BookOpen className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">IT Policies</span>
                  </Button>
                </Link>
                <a href="http://help.inuaai.net" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="h-auto py-3 flex flex-col items-center justify-center w-full gap-1">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">Submit Ticket</span>
                  </Button>
                </a>
                <Link href="/it-calendar" passHref>
                  <Button variant="outline" className="h-auto py-3 flex flex-col items-center justify-center w-full gap-1">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">IT Calendar</span>
                  </Button>
                </Link>
                <Link href="/knowledge-base" passHref>
                  <Button variant="outline" className="h-auto py-3 flex flex-col items-center justify-center w-full gap-1">
                    <Globe className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">Resources</span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>


          {/* Main Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
            {/* Left Column - IT Announcements */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm">
              <div className="p-1 border-b border-slate-200 dark:border-slate-700">
                <h2 className="text-base font-medium flex items-center">
                  <Megaphone className="h-5 w-5 text-red-600 mr-2" />
                  IT Announcements
                </h2>
              </div>
              <div className="p-1">
                {isLoadingAnnouncements && <p className="text-sm text-slate-500">Loading announcements...</p>}
                {announcementsError && <p className="text-sm text-red-500">{announcementsError}</p>}
                {!isLoadingAnnouncements && !announcementsError && (
                  generalAnnouncements.length > 0 ? (
                    <div className="space-y-2">
                      {generalAnnouncements.slice(0, 3).map((ann, index) => ( // Display latest 3 general announcements
                        <div key={ann.id || index} className={index < generalAnnouncements.slice(0,3).length -1 ? "border-b border-slate-100 dark:border-slate-700 pb-2 mb-2" : ""}>
                          <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{ann.title}</p>
                          {ann.createdAt && (
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {new Date(ann.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                          )}
                          <p className="text-sm mt-0.5 text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{ann.content}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">No recent general announcements.</p>
                  )
                )}
              </div>
            </div>
            
            {/* Middle and Right Columns */}
            <div className="lg:col-span-2 space-y-1">
              {/* Tool Setup Checklist */}
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                <div className="p-1 border-b border-slate-200 dark:border-slate-700">
                  <h2 className="text-base font-medium flex items-center">
                    <ListChecks className="h-5 w-5 text-blue-600 mr-2" />
                    Tool Setup Checklist
                  </h2>
                  <p className="text-sm text-slate-500">Tools you confirmed access to or set up.</p>
                </div>
                <div className="p-1">
                  {completedToolsDetails.length > 0 ? (
                    <ul className="space-y-1">
                      {completedToolsDetails.map(tool => (
                        <li key={tool.id} className="text-sm flex items-center">
                          <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                          <span>{tool.name}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-slate-500 text-center py-1">No tool setup data found.</p>
                  )}
                </div>
              </div>

              {/* Tech Trivia */}
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                <div className="p-1 border-b border-slate-200 dark:border-slate-700">
                  <h2 className="text-base font-medium flex items-center">
                    <Zap className="h-5 w-5 text-yellow-600 mr-2" />
                    Tech Trivia!
                  </h2>
                  <p className="text-sm text-slate-500">Did you know?</p>
                </div>
                <div className="p-1">
                  <p className="text-sm italic">
                    {randomFact || "Loading interesting fact..."}
                  </p>
                </div>
              </div>
            </div>

          {/* Urgent Support Alert */}
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-md p-1">
            <div className="flex items-center">
              <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center mr-2">
                <ShieldCheck className="h-3 w-3 text-amber-600" />
              </div>
              <h4 className="text-sm font-medium text-amber-800">Urgent Support</h4>
            </div>
            <p className="text-xs text-amber-700 ml-7">
              For urgent issues, please refer to the after-hours support details provided during onboarding.
            </p>
          </div>
          </div>

        </main>

        <footer className="mt-1 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">&copy; {new Date().getFullYear()} INUA AI SOLUTIONS LTD.</p>
        </footer>
      </div>
    </div>
  );
}