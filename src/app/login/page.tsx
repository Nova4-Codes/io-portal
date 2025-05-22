"use client";

import { useState, useEffect } from "react"; // Import useEffect
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogIn, Loader2, User, Lock } from "lucide-react"; // Removed Mail import
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// Select is removed as role is not selected at login anymore

export default function LoginPage() {
  const router = useRouter();
  const { login, userRole, isLoggedIn } = useAuth();
  // Revert state variables
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [idNumber, setIdNumber] = useState(""); // Represents password or ID number
  const [loginError, setLoginError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Determine login type based on firstName content
  const isLikelyAdminLogin = firstName.includes('@');

  // Adapt validation based on likely login type
  const validateInputs = () => {
    if (!firstName.trim()) return "First Name (or Admin Email) is required.";
    if (!isLikelyAdminLogin && !lastName.trim()) return "Last name is required."; // Only for employees
    if (!idNumber.trim()) return "Password is required.";

    // For employees, validate numeric 6-8 digits
    if (!isLikelyAdminLogin && !/^\d{6,8}$/.test(idNumber)) {
      return "Password must be 6-8 digits (numbers only).";
    }
    // For admins, just ensure password is not empty (can be more complex later)
    if (isLikelyAdminLogin && idNumber.trim().length < 1) { // Basic check for admin password
        return "Password is required.";
    }
    return "";
  };

  const handleLogin = async () => {
    setIsLoading(true);
    setLoginError("");

    const validationError = validateInputs();
    if (validationError) {
      setLoginError(validationError);
      setIsLoading(false);
      return;
    }

    try {
      let success = false;
      if (isLikelyAdminLogin) {
        // Admin attempt: Use firstName as email, idNumber as password
        success = await login({ email: firstName, password: idNumber });
      } else {
        // Employee attempt: Use standard fields
        success = await login({ firstName: firstName, lastName: lastName, idNumber: idNumber });
      }

      if (success) {
         // Redirect is handled by useEffect based on role fetched during login
         // No need to push here explicitly unless useEffect fails
      } else {
        // API should return 401 for invalid creds, context might set an error or return false
        setLoginError("Invalid credentials or user not found.");
      }
    } catch (error: any) { // Catch specific errors if possible
      console.error("Login error:", error);
      // Use error message from context/API if available, otherwise generic
      setLoginError(error?.message || "An unexpected error occurred during login.");
    } finally {
      setIsLoading(false);
    }
  };

  // useEffect to handle redirection after login state changes (Updated)
  useEffect(() => {
    if (isLoggedIn && userRole) {
      // Redirect based on role
      if (userRole === 'ADMIN') {
        router.push("/admin/dashboard"); // Or your desired admin route
      } else {
        router.push("/dashboard");
      }
    }
  }, [isLoggedIn, userRole, router]);

  // Wait until mounted before checking login state to avoid hydration errors
  if (!mounted) {
    // Render null or a minimal loading skeleton during server render and initial client mount
    return null;
  }

  // If mounted and logged in, show redirecting message
  if (isLoggedIn && userRole) {
     return (
       <div className="flex items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-900">
         <p className="text-lg text-muted-foreground">Redirecting...</p>
       </div>
     );
  }
  
  // If mounted and not logged in, render the login form
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-red-50 via-red-100 to-pink-100 dark:from-slate-900 dark:to-red-950 p-4 overflow-hidden">
      {/* Background Shapes */}
      <div className="absolute top-[-10%] left-[-10%] w-72 h-72 bg-red-300 dark:bg-red-700 rounded-full opacity-40 blur-3xl animate-pulse"></div>
      <div className="absolute bottom-[-15%] right-[-5%] w-96 h-96 bg-pink-300 dark:bg-pink-700 rounded-full opacity-30 blur-3xl animate-pulse animation-delay-4000"></div>

      {/* Eye-catching Header */}
      <h1 className="text-4xl sm:text-5xl font-extrabold mb-10 text-center bg-gradient-to-r from-red-600 via-red-500 to-pink-500 bg-clip-text text-transparent drop-shadow-sm px-2">
        INUA AI SOLUTIONS LTD.
      </h1>

      {/* Login Card */}
      <Card className="relative z-10 w-full max-w-md shadow-2xl rounded-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
        <CardHeader className="p-4 sm:p-5 text-center">
          <div className="flex justify-center mb-2">
            <LogIn className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            IT Portal Sign In
          </CardTitle>
          <CardDescription className="text-muted-foreground text-sm">
             Sign in with your First Name, Last Name, and numeric Password.
          </CardDescription>
          <div className="mt-1 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 p-1.5 rounded-md">
            <p><strong>Just finished onboarding?</strong> Use the same details you registered with to sign in.</p>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 p-4 sm:p-5">
          {/* First Name Field (doubles as Admin Email) */}
          <div className="grid gap-1 relative">
            <Label htmlFor="firstName" className="text-sm">First Name</Label>
            <User className="absolute left-2 top-[calc(1.25rem+8px)] h-3.5 w-3.5 text-muted-foreground" />
            <Input
              id="firstName"
              type="text"
              placeholder="Enter your first name"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="pl-8 h-9 text-sm transition-colors focus:ring-1 focus:ring-primary-focus focus:border-primary-focus disabled:opacity-70"
              disabled={isLoading}
            />
          </div>
          {/* Last Name Field (Standard Employee Login) */}
          <div className="grid gap-1 relative">
            <Label htmlFor="lastName" className="text-sm">Last Name</Label>
            <User className="absolute left-2 top-[calc(1.25rem+8px)] h-3.5 w-3.5 text-muted-foreground" />
            <Input
              id="lastName"
              type="text"
              placeholder="Enter your last name"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="pl-8 h-9 text-sm transition-colors focus:ring-1 focus:ring-primary-focus focus:border-primary-focus disabled:opacity-70"
              disabled={isLoading || isLikelyAdminLogin}
            />
          </div>
          {/* Password Field (6-8 digit numeric password) */}
          <div className="grid gap-1 relative">
            <Label htmlFor="idNumber" className="text-sm">
              {isLikelyAdminLogin ? "Password" : "Password (6-8 digits)"}
            </Label>
            <Lock className="absolute left-2 top-[calc(1.25rem+8px)] h-3.5 w-3.5 text-muted-foreground" />
            <Input
              id="idNumber"
              type="password"
              placeholder={isLikelyAdminLogin ? "Enter your password" : "Enter your numeric password"}
              required
              value={idNumber}
              onChange={(e) => {
                if (isLikelyAdminLogin) {
                  setIdNumber(e.target.value); // Allow any characters for admin
                } else {
                  // Only allow numeric input for employees
                  if (/^\d*$/.test(e.target.value)) {
                    setIdNumber(e.target.value);
                  }
                }
              }}
              maxLength={isLikelyAdminLogin ? undefined : 8} // No maxLength for admin, 8 for employee
              className="pl-8 h-9 text-sm transition-colors focus:ring-1 focus:ring-primary-focus focus:border-primary-focus disabled:opacity-70"
              disabled={isLoading}
            />
            <p className="text-xs text-slate-500 mt-1">
              {isLikelyAdminLogin
                ? "Enter the password associated with your admin account."
                : "Password must be 6-8 digits (numbers only)"}
            </p>
          </div>
          {loginError && <p id="login-error" className="text-xs text-red-500 dark:text-red-400 mt-0.5 text-center">{loginError}</p>}
          
          <div className="mt-2 text-center">
            <a
              href="http://help.inuaai.net"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              Forgot your password? Contact IT Support
            </a>
          </div>
        </CardContent>
        <CardFooter className="p-4 sm:p-5 flex flex-col items-center">
          <Button
            className="w-full py-2 text-sm font-medium rounded-md bg-gradient-to-r from-pink-500 to-red-500 text-white hover:from-pink-600 hover:to-red-600 focus:ring-1 focus:ring-offset-1 focus:ring-red-500 transition-all disabled:opacity-70"
            onClick={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            ) : (
              "Sign In"
            )}
          </Button>
          {/* Separator and Onboarding Button */}
          <div className="relative mt-4 w-full">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-300 dark:border-slate-600" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white/80 dark:bg-slate-800/80 px-2 text-muted-foreground">
                New to INUA AI?
              </span>
            </div>
          </div>
          <Link href="/onboarding?role=employee" passHref className="w-full mt-3">
             <Button className="w-full py-2 text-sm font-medium rounded-md bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 focus:ring-1 focus:ring-offset-1 focus:ring-purple-500 transition-all disabled:opacity-70">
               Start Onboarding
             </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}