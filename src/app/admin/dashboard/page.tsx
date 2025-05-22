"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label'; // Added Label import
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"; // Added Table components
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from 'date-fns';
import {
  LogOut,
  Search,
  Users,
  UserCheck,
  UserX,
  ChevronLeft,
  ChevronRight,
  Filter,
  ShieldAlert, // For Login Attempts
  ClipboardList, // For Announcements
  Users2, // For Employee Management Icon
  Trash2, // For Delete User Icon
  CalendarClock // For Maintenance Calendar Icon
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Import Tabs components
import { cn } from "@/lib/utils"; // Import cn for conditional class names
import { allPolicies, allToolDetails } from '@/data/dashboardConstants';
import AnnouncementsSection from '@/components/admin/AnnouncementsSection'; // Import AnnouncementsSection
import LoginAttemptsSection from '@/components/admin/LoginAttemptsSection'; // Import LoginAttemptsSection
import MaintenanceSchedulerSection from '@/components/admin/MaintenanceSchedulerSection'; // Import MaintenanceSchedulerSection

// Interface for the fetched employee data
interface EmployeeData {
  id: number;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  agreedPolicies: string[];
  completedTools: string[];
  createdAt: string; // Assuming string from JSON
}

// Filter options
type FilterOption = 'all' | 'complete' | 'pending';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { isLoggedIn, userRole, logout } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [employees, setEmployees] = useState<EmployeeData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true); // For employee data
  const [error, setError] = useState<string | null>(null); // For employee data
  
  // Filtering state for employees
  const [filterStatus, setFilterStatus] = useState<FilterOption>('all');
  const [userToDelete, setUserToDelete] = useState<EmployeeData | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Pagination state for employees
  const [currentPage, setCurrentPage] = useState(1);
  const employeesPerPage = 9; // Show 9 employees per page (3x3 grid)

  // Calculate total policies/tools once
  const totalPolicies = allPolicies.length;
  // Filter tools relevant for employees (excluding admin-specific ones if any)
  const employeeTools = allToolDetails.filter(t => t.id !== 't_admin_iam');
  const totalTools = employeeTools.length;

  // Calculate progress for an employee
  const calculateProgress = (emp: EmployeeData) => {
    const policiesProgress = totalPolicies > 0 ? (emp.agreedPolicies.length / totalPolicies) * 100 : 0;
    const toolsProgress = totalTools > 0 ? (emp.completedTools.length / totalTools) * 100 : 0;
    const isComplete = policiesProgress >= 100 && toolsProgress >= 100;
    
    // If onboarding is complete, show 100% for both policies and tools
    return {
      policiesProgress: isComplete ? 100 : policiesProgress,
      toolsProgress: isComplete ? 100 : toolsProgress,
      isComplete
    };
  };

  // Filter employees
  const filteredEmployees = useMemo(() => {
    // First filter by search term
    let result = employees;
    
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(emp =>
        emp.firstName?.toLowerCase().includes(lowerSearchTerm) ||
        emp.lastName?.toLowerCase().includes(lowerSearchTerm) ||
        emp.email?.toLowerCase().includes(lowerSearchTerm)
      );
    }
    
    // Then filter by status
    if (filterStatus !== 'all') {
      result = result.filter(emp => {
        const { isComplete } = calculateProgress(emp);
        return filterStatus === 'complete' ? isComplete : !isComplete;
      });
    }
    
    return result;
  }, [employees, searchTerm, filterStatus, totalPolicies, totalTools]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredEmployees.length / employeesPerPage);
  const paginatedEmployees = useMemo(() => {
    const startIndex = (currentPage - 1) * employeesPerPage;
    return filteredEmployees.slice(startIndex, startIndex + employeesPerPage);
  }, [filteredEmployees, currentPage, employeesPerPage]);

  // Calculate summary stats
  const totalEmployees = employees.length;
  const completedCount = useMemo(() => employees.filter(emp => {
    const { isComplete } = calculateProgress(emp);
    return isComplete;
  }).length, [employees, totalPolicies, totalTools]);
  const pendingCount = totalEmployees - completedCount;
  
  useEffect(() => {
    setMounted(true);
    // Fetch employee data only if authenticated as ADMIN
    if (isLoggedIn && userRole === 'ADMIN') {
      const fetchEmployees = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const response = await fetch('/api/admin/users');
          if (!response.ok) {
            throw new Error(`Failed to fetch employees: ${response.statusText}`);
          }
          const data = await response.json();
          setEmployees(data.users || []);
        } catch (err: any) {
          console.error("Error fetching employee data:", err);
          setError(err.message || 'Failed to load employee data.');
        } finally {
          setIsLoading(false);
        }
      };
      fetchEmployees();
    }
  }, [isLoggedIn, userRole]);

  const fetchEmployees = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/users');
      if (!response.ok) {
        throw new Error(`Failed to fetch employees: ${response.statusText}`);
      }
      const data = await response.json();
      setEmployees(data.users || []);
    } catch (err: any) {
      console.error("Error fetching employee data:", err);
      setError(err.message || 'Failed to load employee data.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      const response = await fetch(`/api/admin/users/${userToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete user');
      }

      // Refresh employee list
      await fetchEmployees();
      // Optionally: show a success toast/message
      console.log(`User ${userToDelete.firstName} ${userToDelete.lastName} deleted successfully.`);

    } catch (err: any) {
      console.error('Error deleting user:', err);
      // Optionally: show an error toast/message
      setError(`Error deleting user: ${err.message}`); // Display error on dashboard
    } finally {
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };


  // Reset to first page when filters change (for employees)
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  // Route protection: Redirect if not logged in or not an admin
  useEffect(() => {
    if (mounted) {
      if (!isLoggedIn) {
        router.push('/login');
      } else if (userRole !== 'ADMIN') {
        // Redirect non-admins away (e.g., to employee dashboard or login)
        router.push('/dashboard'); 
      }
    }
  }, [mounted, isLoggedIn, userRole, router]);

  // Render loading state or null while checking auth/role
  if (!mounted || !isLoggedIn || userRole !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-900">
        <p className="text-lg text-muted-foreground">Loading Admin Dashboard...</p>
      </div>
    );
  }
  
  // --- Admin Dashboard Content ---
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 p-4 sm:p-6 md:p-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">Admin Dashboard</h1>
        <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto">
          <div className="relative flex-grow sm:flex-grow-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full sm:w-64 h-9"
            />
          </div>
          <Button onClick={logout} variant="outline" size="icon" aria-label="Logout">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>
      
      <main>
        <Tabs defaultValue="employees" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6"> {/* Updated grid-cols-3 to grid-cols-4 */}
            <TabsTrigger value="employees">
              <Users2 className="mr-2 h-4 w-4" /> Employee Management
            </TabsTrigger>
            <TabsTrigger value="announcements">
              <ClipboardList className="mr-2 h-4 w-4" /> Announcements
            </TabsTrigger>
            <TabsTrigger value="loginAttempts">
              <ShieldAlert className="mr-2 h-4 w-4" /> Login Attempts
            </TabsTrigger>
            <TabsTrigger value="maintenance">
              <CalendarClock className="mr-2 h-4 w-4" /> Maintenance Calendar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="employees" className="space-y-6">
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{isLoading ? '...' : totalEmployees}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Onboarding Complete</CardTitle>
                  <UserCheck className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{isLoading ? '...' : completedCount}</div>
                </CardContent>
              </Card>
            </div>

            {/* Filter Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as FilterOption)}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Employees</SelectItem>
                    <SelectItem value="complete">Completed Onboarding</SelectItem>
                    <SelectItem value="pending">Pending Onboarding</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    aria-label="Next page"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Loading and Error States */}
            {isLoading && (
              <Card>
                <CardContent className="p-8">
                  <p className="text-center text-muted-foreground">Loading employees...</p>
                </CardContent>
              </Card>
            )}
            
            {error && (
              <Card className="border-red-200 dark:border-red-800">
                <CardContent className="p-8">
                  <p className="text-center text-red-500">{error}</p>
                </CardContent>
              </Card>
            )}
            
            {/* Employee Table */}
            {!isLoading && !error && (
              <>
                {filteredEmployees.length === 0 ? (
                  <Card>
                    <CardContent className="p-8">
                      <p className="text-center text-muted-foreground">
                        {searchTerm ? 'No employees found matching your search.' : 'No employees registered yet.'}
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="p-0"> {/* Remove padding for table to fit well */}
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[230px]">Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead className="w-[150px] text-center">Onboarding Status</TableHead>
                            <TableHead className="w-[100px] text-center">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginatedEmployees.map((emp) => {
                            const { isComplete } = calculateProgress(emp);
                            return (
                              <TableRow key={emp.id} className={cn(isComplete ? 'bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50')}>
                                <TableCell className="font-medium">
                                  {emp.firstName || 'N/A'}{emp.lastName ? ` ${emp.lastName}` : ''}
                                  <div className="text-xs text-muted-foreground">ID: {emp.id}</div>
                                </TableCell>
                                <TableCell className="text-muted-foreground truncate max-w-[230px]">
                                  {emp.email || <span className="italic">No email</span>}
                                </TableCell>
                                <TableCell className="text-center">
                                  <Badge variant={isComplete ? "default" : "secondary"}
                                    className={cn(
                                      "font-semibold px-3 py-1 text-xs",
                                      isComplete
                                      ? 'bg-green-100 text-green-700 dark:bg-green-700/30 dark:text-green-300 border border-green-200 dark:border-green-600/50'
                                      : 'bg-orange-100 text-orange-700 dark:bg-orange-700/30 dark:text-orange-300 border border-orange-200 dark:border-orange-600/50'
                                    )}
                                  >
                                    {isComplete ? 'Complete' : 'Pending'}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-center">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                    onClick={() => {
                                      setUserToDelete(emp);
                                      setIsDeleteDialogOpen(true);
                                    }}
                                    aria-label="Delete user"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                )}
                
                {/* Pagination Info */}
                {filteredEmployees.length > 0 && (
                  <div className="text-center text-sm text-muted-foreground mt-4">
                    Showing {paginatedEmployees.length} of {filteredEmployees.length} employees
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="announcements">
            <AnnouncementsSection />
          </TabsContent>

          <TabsContent value="loginAttempts">
            <LoginAttemptsSection />
          </TabsContent>

          <TabsContent value="maintenance">
            <MaintenanceSchedulerSection />
          </TabsContent>
        </Tabs>
      </main>

      {userToDelete && (
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the user
                <span className="font-semibold"> {userToDelete.firstName} {userToDelete.lastName} (ID: {userToDelete.id}) </span>
                and all associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setUserToDelete(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteUser}
                className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white"
              >
                Yes, delete user
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      <footer className="mt-12 text-center">
        <p className="text-sm text-slate-500 dark:text-slate-400">&copy; {new Date().getFullYear()} INUA AI SOLUTIONS LTD.</p>
      </footer>
    </div>
  );
}