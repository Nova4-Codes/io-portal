"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  ArrowLeft, 
  Wifi, 
  Printer, 
  Mail, 
  Monitor, 
  HardDrive, 
  Laptop, 
  RefreshCw, 
  Lock, 
  Search 
} from 'lucide-react';
import Link from 'next/link';

export default function KnowledgeBasePage() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [mounted, setMounted] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');

  // Effect to set mounted to true after initial render
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Effect for redirecting if not logged in, only if mounted
  useEffect(() => {
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

  // Knowledge base articles
  const articles = [
    {
      id: 'wifi',
      icon: Wifi,
      title: 'Wi-Fi Connectivity Issues',
      category: 'Network',
      content: [
        'Ensure Wi-Fi is turned on in your device settings.',
        'Try forgetting the network and reconnecting with the correct password.',
        'Move closer to the router to improve signal strength.',
        'Restart your device and the router (unplug for 30 seconds, then plug back in).',
        'Check if other devices can connect to the same network.',
        'If problems persist, contact IT support with your device details and location.'
      ]
    },
    {
      id: 'printer',
      icon: Printer,
      title: 'Printer Troubleshooting',
      category: 'Hardware',
      content: [
        'Check if the printer is powered on and connected to the network.',
        'Ensure you have selected the correct printer from the print dialog.',
        'Verify that there is paper in the tray and no paper jams.',
        'Check for error messages on the printer display.',
        'Try restarting both your computer and the printer.',
        'For persistent issues, note the printer model and error message before contacting IT support.'
      ]
    },
    {
      id: 'email',
      icon: Mail,
      title: 'Email Access Problems',
      category: 'Software',
      content: [
        'Verify your internet connection is working properly.',
        'Check that you are using the correct email address and password.',
        'Clear your browser cache if using webmail.',
        'Restart your email application or browser.',
        'Ensure your account has not been locked due to multiple failed login attempts.',
        'If using Outlook, run the built-in repair tool (File > Account Settings > Repair).'
      ]
    },
    {
      id: 'display',
      icon: Monitor,
      title: 'Display and Monitor Issues',
      category: 'Hardware',
      content: [
        'Check that all cables are securely connected to both the monitor and computer.',
        'Ensure the monitor is powered on (look for power indicator light).',
        "Try pressing the monitor's input/source button to select the correct input.",
        "For laptops, try toggling the display output using Fn+F4 or similar key combination.",
        "Adjust resolution settings in your computer's display settings.",
        "If using a docking station, try connecting directly to the computer instead."
      ]
    },
    {
      id: 'storage',
      icon: HardDrive,
      title: 'Storage and File Access',
      category: 'System',
      content: [
        'Check if you have sufficient permissions to access the files or folders.',
        'Ensure network drives are properly mapped if accessing network storage.',
        'Verify that you have enough disk space available.',
        'Run a disk check utility to scan for errors (right-click drive > Properties > Tools > Check).',
        "Try accessing the files from another computer to determine if it's a file or system issue.",
        "For cloud storage issues, check your internet connection and try signing out and back in."
      ]
    },
    {
      id: 'performance',
      icon: Laptop,
      title: 'Computer Running Slowly',
      category: 'System',
      content: [
        'Restart your computer to clear temporary files and refresh system resources.',
        'Check for and close resource-intensive applications using Task Manager (Ctrl+Shift+Esc).',
        'Ensure your device has adequate free disk space (at least 10% of total capacity).',
        'Check for and install pending system updates.',
        'Run a virus scan to check for malware.',
        'Limit the number of startup programs (Task Manager > Startup tab).'
      ]
    },
    {
      id: 'restart',
      icon: RefreshCw,
      title: 'When to Restart Your Device',
      category: 'General',
      content: [
        'After installing new software or updates.',
        'When experiencing slow performance or application freezes.',
        'If peripherals (printers, scanners, etc.) stop responding.',
        'When network connectivity issues occur.',
        'If you encounter unusual behavior or error messages.',
        'As a first troubleshooting step for most technical issues.'
      ]
    },
    {
      id: 'password',
      icon: Lock,
      title: 'Password Management',
      category: 'Security',
      content: [
        'Remember that your password must be 6-8 numeric digits.',
        'Do not share your password with anyone, including IT staff.',
        'Do not use the same password for multiple accounts.',
        'If you suspect your password has been compromised, change it immediately.',
        'Use the "Forgot Password" link on the login page if you cannot remember your password.',
        'For security reasons, passwords must be changed every 90 days.'
      ]
    }
  ];

  // Filter articles based on search term
  const filteredArticles = searchTerm 
    ? articles.filter(article => 
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.content.some(item => item.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : articles;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            IT Knowledge Base
          </h1>
          <Link href="/dashboard" passHref>
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Button>
          </Link>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search troubleshooting guides..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          />
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button 
            variant="outline" 
            size="sm" 
            className={!searchTerm ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : ""}
            onClick={() => setSearchTerm('')}
          >
            All
          </Button>
          {Array.from(new Set(articles.map(a => a.category))).map(category => (
            <Button 
              key={category} 
              variant="outline" 
              size="sm"
              className={searchTerm === category ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : ""}
              onClick={() => setSearchTerm(category)}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Articles */}
        <div className="space-y-6">
          {filteredArticles.length > 0 ? (
            filteredArticles.map(article => (
              <Card key={article.id} className="shadow-md hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-center">
                    <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30 mr-3">
                      <article.icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{article.title}</CardTitle>
                      <CardDescription>{article.category}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {article.content.map((item, index) => (
                      <li key={index} className="flex items-start text-sm text-slate-700 dark:text-slate-300">
                        <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mt-1.5 mr-2"></span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-500 dark:text-slate-400">No articles found matching your search.</p>
              <Button 
                variant="link" 
                onClick={() => setSearchTerm('')}
                className="mt-2"
              >
                Clear search
              </Button>
            </div>
          )}
        </div>

        {/* Contact IT Support */}
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-900/30 mt-8">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-400 mb-2">Need more help?</h3>
            <p className="text-blue-700 dark:text-blue-300 mb-4">
              If you couldn't find a solution to your problem, please contact the IT support team.
            </p>
            <div className="flex flex-wrap gap-4">
              <a 
                href="http://tickets.inuaai.net" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                Submit a Ticket
              </a>
              <a 
                href="mailto:ITSUPPORTDESK@INUAAI.COM"
                className="inline-flex items-center px-4 py-2 rounded-md bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 border border-blue-300 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors"
              >
                Email Support
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}