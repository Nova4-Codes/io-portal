"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { ShieldAlert } from 'lucide-react';

interface LoginAttempt {
  id: number;
  timestamp: string;
  ipAddress: string | null;
  userAgent: string | null;
  attemptedIdentifier: string;
  success: boolean;
  userId: number | null;
  user?: {
    id: number;
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
  } | null;
}

interface LoginAttemptsSectionProps {
  // Add any necessary props
}

const LoginAttemptsSection: React.FC<LoginAttemptsSectionProps> = () => {
  const [loginAttempts, setLoginAttempts] = useState<LoginAttempt[]>([]);
  const [isLoadingLoginAttempts, setIsLoadingLoginAttempts] = useState(true);
  const [loginAttemptsError, setLoginAttemptsError] = useState<string | null>(null);

  useEffect(() => {
    fetchLoginAttempts();
  }, []);

  const fetchLoginAttempts = async () => {
    setIsLoadingLoginAttempts(true);
    setLoginAttemptsError(null);
    try {
      const response = await fetch('/api/admin/login-attempts');
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || `Failed to fetch login attempts: ${response.statusText}`);
      }
      const data = await response.json();
      setLoginAttempts(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("Error fetching login attempts:", err);
      setLoginAttemptsError(err.message || 'Failed to load login attempts.');
    } finally {
      setIsLoadingLoginAttempts(false);
    }
  };

  return (
    <section className="space-y-4 mt-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-orange-600" />
            <CardTitle>Recent Login Attempts</CardTitle>
          </div>
          <CardDescription>Showing the latest 100 login attempts to the portal.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoadingLoginAttempts && <p className="p-4 text-center text-muted-foreground">Loading login attempts...</p>}
          {loginAttemptsError && <p className="p-4 text-center text-red-500">{loginAttemptsError}</p>}
          {!isLoadingLoginAttempts && !loginAttemptsError && (
            loginAttempts.length === 0 ? (
              <p className="p-4 text-center text-muted-foreground">No login attempts recorded yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Timestamp</TableHead>
                    <TableHead>Identifier</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead>User</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loginAttempts.map((attempt: LoginAttempt) => (
                    <TableRow key={attempt.id} className={!attempt.success ? "bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30" : "hover:bg-slate-50 dark:hover:bg-slate-800/50"}>
                      <TableCell className="text-sm">{new Date(attempt.timestamp).toLocaleString()}</TableCell>
                      <TableCell className="text-sm truncate max-w-[250px]">{attempt.attemptedIdentifier}</TableCell>
                      <TableCell className="text-sm">{attempt.ipAddress || 'N/A'}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={attempt.success ? 'default' : 'destructive'}
                          className={attempt.success ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 border-green-300 dark:border-green-700' : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 border-red-300 dark:border-red-700'}
                        >
                          {attempt.success ? 'Success' : 'Failed'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {attempt.user ? `${attempt.user.firstName || ''} ${attempt.user.lastName || ''} (ID: ${attempt.user.id})` : (attempt.success ? 'N/A' : '')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )
          )}
        </CardContent>
      </Card>
    </section>
  );
};

export default LoginAttemptsSection;