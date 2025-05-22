"use client";

import React, { useEffect, useState, Fragment } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext'; // Import useAuth
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ChevronRight, CheckCircle, Lock, KeyRound, ListChecks, User, Mail,
  Smartphone, ShieldCheck, HelpCircle, FileX, Monitor, Ban, AlertTriangle,
  Usb, Scan, WifiOff, Database, FileCheck, Trash2, LifeBuoy, LogIn, Loader2,
  ListTodo, DownloadCloud, Wifi, Globe, Cloud, CopyX, RefreshCw, Clock,
  Server, DatabaseBackup, History, FileCog, Phone, Wrench, Network, Printer,
  MessageSquare, GraduationCap, Link, Fingerprint, Laptop, Settings,
  BookUser, ShieldAlert, ShieldQuestion, FileText, MailQuestion, HardDrive,
  CloudUpload, CloudDownload, Route, Ticket, UserCog, UserCheck, Users,
  FileClock, FileSearch, FileWarning, PhoneCall, MessageCircleQuestion,
  BookOpenCheck, BrainCircuit, MailCheck as MailCheckIcon,
  ArrowRight, CheckCircle2
} from 'lucide-react';
import { allPolicies, PolicyInfo, policyModulesData } from '@/data/dashboardConstants'; // Import centralized policy and module data
import { getIconForPolicyItem, renderMarkdownContent } from '@/lib/onboardingUtils'; // Import helpers
import WelcomeAnimation from '@/components/features/WelcomeAnimation'; // Import WelcomeAnimation component

// Updated Policy interface for local state management (only needs agreed status)
interface PolicyState extends Omit<PolicyInfo, 'content'> { // Use Omit to exclude content
  agreed: boolean;
}
// Keep Tool interface as is
interface Tool {
  id: string;
  name: string;
  checked: boolean;
}

// Remove local policy definition
// const newInuaAIPolicies: Omit<Policy, 'agreed'>[] = [ ... ];

// Remove local module definitions
// interface PolicyModuleConfig { ... }
// const newPolicyModulesData: PolicyModuleConfig[] = [ ... ];


const allRolesTools: Omit<Tool, 'checked'>[] = [
  { id: 't0_account', name: 'Domain Account & Password (Received/Set)' }, // Combined item
  // { id: 't0_domain', name: 'Domain Name (Received)' }, // Removed
  // { id: 't0_pass', name: 'Password (Set/Changed)' }, // Removed
  { id: 't1', name: 'Email Client (Titan/Gmail) Setup' },
  { id: 't_zammad', name: 'Zammad (IT Support Platform) Login Confirmed' },
];
const employeeToolsList: Omit<Tool, 'checked'>[] = [...allRolesTools];
const adminToolsList: Omit<Tool, 'checked'>[] = [
  ...allRolesTools,
  { id: 't_admin_iam', name: 'Admin: IAM Console Access Verified' },
];

const getModuleProgressString = (completed: number, total: number): string => {
  if (total === 0) return '░░░░░';
  const percentage = (completed / total);
  const blocksFilled = Math.round(percentage * 5);
  const blocksEmpty = 5 - blocksFilled;
  return '▓'.repeat(blocksFilled) + '░'.repeat(blocksEmpty);
};


export default function OnboardingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const {
    userRole: contextRole,
    agreePolicy,
    checkTool, // New from context
    completeOnboardingAndRegister, // Renamed function from context
    logout
  } = useAuth();
  const [role, setRole] = useState<string | null>(null); // Local state for display
  
  // State for user details
  const [firstName, setFirstName] = useState<string>(""); // Initialize as empty
  const [lastName, setLastName] = useState<string>(""); // Initialize as empty
  const [idNumber, setIdNumber] = useState<string>(""); // Initialize as empty
  const [registrationError, setRegistrationError] = useState<string>(""); // For showing API errors
  const [isRegistering, setIsRegistering] = useState<boolean>(false); // Loading state for registration

  const [policies, setPolicies] = useState<PolicyState[]>([]); // Use new PolicyState type
  const [tools, setTools] = useState<Tool[]>([]);
  
  const [showWelcomeAnimation, setShowWelcomeAnimation] = useState(false);

  useEffect(() => {
    // Use role from context if available, otherwise from searchParams
    const initialRole = contextRole || searchParams.get('role');
    if (initialRole) {
      setRole(initialRole);
      // Initialize local policy state from the imported centralized data
      setPolicies(allPolicies.map(p => ({ id: p.id, title: p.title, agreed: false }))); // Use imported allPolicies
      // Use initialRole here
      if (initialRole === 'admin') {
        setTools(adminToolsList.map(t => ({ ...t, checked: false })));
      } else {
        setTools(employeeToolsList.map(t => ({ ...t, checked: false })));
      }
    }
  }, [searchParams, contextRole]);

  const handleAgreePolicy = (policyId: string) => {
    setPolicies(prevPolicies =>
      prevPolicies.map(p => (p.id === policyId ? { ...p, agreed: true } : p))
    );
    agreePolicy(policyId);
  };

  const handleToolCheck = (toolId: string, checked: boolean) => {
    setTools(prevTools =>
      prevTools.map(t => (t.id === toolId ? { ...t, checked } : t))
    );
    checkTool(toolId); // Call context function
  };

  const completedPoliciesCount = policies.filter(p => p.agreed).length;
  const completedToolsCount = tools.filter(t => t.checked).length;

  const allPoliciesAgreed = policies.length > 0 && completedPoliciesCount === policies.length;
  const allToolsChecked = tools.length > 0 && completedToolsCount === tools.length;

  const totalOverallSteps = policies.length + tools.length;
  const completedOverallSteps = completedPoliciesCount + completedToolsCount;
  const overallProgressPercentage = totalOverallSteps > 0 ? (completedOverallSteps / totalOverallSteps) * 100 : 0;

  const handleFinishOnboarding = async () => { // Make async
    setRegistrationError(""); // Clear previous errors
    if (!allPoliciesAgreed || !allToolsChecked || !role || !firstName || !lastName || !idNumber) {
       setRegistrationError("Please complete all steps and fill in your details.");
       console.warn("Cannot complete onboarding: Missing role, name, or ID, or not all items checked.");
       return;
    }

    setIsRegistering(true); // Set loading state

    try {
      const result = await completeOnboardingAndRegister({
        firstName,
        lastName,
        idNumber,
        userRole: role, // role should be set from context or query param
        currentAgreedPolicies: policies.filter(p => p.agreed).map(p => p.id),
        currentCompletedTools: tools.filter(t => t.checked).map(t => t.id),
      });

      if (result.success) {
        setShowWelcomeAnimation(true);
      } else {
        // Use the specific error message from the API if available
        setRegistrationError(result.errorMessage || "Registration failed. Please check your details or try again later.");
      }
    } catch (error) {
        console.error("Error during registration process:", error);
        setRegistrationError("An unexpected error occurred during registration.");
    } finally {
        setIsRegistering(false); // Clear loading state
    }
  };

  if (!role) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <p className="text-lg text-muted-foreground">Loading onboarding information...</p>
      </div>
    );
  }

  if (showWelcomeAnimation) {
    return (
      <WelcomeAnimation
        onProceedToLogin={() => {
          logout();
          router.push('/login');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 dark:from-slate-900 dark:to-red-950 p-4 sm:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Modern Header */}
        <header className="mb-12 text-center">
          <div className="inline-block p-2 px-4 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 font-medium text-sm mb-4">
            INUA AI SOLUTIONS LTD.
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            IT Department Onboarding
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
            Welcome to your complete guide to all things IT at INUA AI. Follow the steps below to complete your onboarding process.
          </p>
          <div className="mt-4 flex justify-center">
            <a
              href="http://help.inuaai.net"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 transition-colors"
            >
              <LifeBuoy className="h-4 w-4 mr-2" />
              Need help? Visit our support portal
            </a>
          </div>
        </header>
        <Separator className="my-4" />

        {/* Overall Progress Bar Section removed to streamline UI */}

        {/* Policy Modules */}
        {policyModulesData.map((module, moduleIndex) => { // Use imported policyModulesData
          const modulePolicies = policies.filter(p => module.policyIds.includes(p.id));
          const completedModulePolicies = modulePolicies.filter(p => p.agreed).length;
          const moduleProgressText = getModuleProgressString(completedModulePolicies, modulePolicies.length);
          const moduleProgressPercent = modulePolicies.length > 0 ? Math.round((completedModulePolicies / modulePolicies.length) * 100) : 0;

          return (
            <Fragment key={module.id}>
              <section className="mb-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{module.displayTitle}</h3>
                    <Badge variant={completedModulePolicies === modulePolicies.length ? "default" : "outline"}
                      className={completedModulePolicies === modulePolicies.length ?
                        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" : ""}>
                      {completedModulePolicies === modulePolicies.length ?
                        "Completed" : `${completedModulePolicies}/${modulePolicies.length} Completed`}
                    </Badge>
                  </div>
                  {/* Module progress bars removed to save space */}
                </div>
                
                <div className="p-4 space-y-4">
                  {/* Map through the local policy state */}
                  {modulePolicies.map(policyState => {
                    // Find the corresponding full policy details from the imported constant
                    const fullPolicy = allPolicies.find(p => p.id === policyState.id);
                    if (!fullPolicy) return null; // Should not happen if data is consistent

                    return (
                      <div key={policyState.id}
                        className={`p-3 rounded-lg transition-all ${
                          policyState.agreed
                            ? 'bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/30'
                            : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:shadow-md'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-lg font-semibold text-slate-900 dark:text-white">{policyState.title}</h4>
                          {policyState.agreed && (
                            <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-900/30">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Agreed
                            </Badge>
                          )}
                        </div>
                        <div className="mb-3 prose prose-sm dark:prose-invert max-w-none">
                          {/* Pass the full policy content to the renderer */}
                          {renderMarkdownContent(policyState.id, fullPolicy.content)}
                        </div>
                        <Button
                          onClick={() => handleAgreePolicy(policyState.id)}
                          disabled={policyState.agreed}
                          variant={policyState.agreed ? "outline" : "default"}
                          size="sm"
                          className={`transition-all ${
                            policyState.agreed
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-900/30 cursor-not-allowed'
                              : 'hover:bg-primary/90'
                          }`}
                        >
                          {policyState.agreed ? "I Have Agreed" : "I Understand and Agree"}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </section>
            </Fragment>
          );
        })}

        {/* Tool Setup Module */}
        <section className="mb-12 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Tool Setup Checklist</h3>
              <Badge variant={allToolsChecked ? "default" : "outline"}
                className={allToolsChecked ?
                  "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" : ""}>
                {allToolsChecked ?
                  "Completed" : `${completedToolsCount}/${tools.length} Completed`}
              </Badge>
            </div>
            {/* Tools checklist progress bar removed to streamline UI */}
          </div>
          
          <div className="p-6">
            <p className="text-slate-600 dark:text-slate-400 mb-6">Confirm you have access to or have set up the following tools.</p>
            <div className="space-y-3">
              {tools.map(tool => (
                <div
                  key={tool.id}
                  className={`flex items-center p-4 rounded-lg transition-all ${
                    tool.checked
                      ? 'bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/30'
                      : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:shadow-md'
                  }`}
                >
                  <Checkbox
                    id={tool.id}
                    checked={tool.checked}
                    onCheckedChange={(checkedState) => handleToolCheck(tool.id, !!checkedState)}
                    aria-label={tool.name}
                    className="mr-3"
                  />
                  <div className="flex-grow">
                    <Label htmlFor={tool.id} className="font-medium text-slate-900 dark:text-white cursor-pointer">
                      {tool.name}
                    </Label>
                  </div>
                  {tool.checked && (
                    <CheckCircle2 className="h-5 w-5 text-green-500 ml-2" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
        
        <Separator className="my-12" />

        {/* User Details for Registration */}
        <section className="mb-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Your Details</h3>
              <Badge variant={firstName && lastName && idNumber ? "default" : "outline"}
                className={firstName && lastName && idNumber ?
                  "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" : ""}>
                {firstName && lastName && idNumber ? "Complete" : "Incomplete"}
              </Badge>
            </div>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              Please provide your details to complete the registration process.
            </p>
          </div>
          
          <div className="p-4">
            <div className="space-y-3">
              <div className="flex flex-col sm:grid sm:grid-cols-2 gap-3 sm:gap-5">
                <div>
                  <Label htmlFor="firstName" className="text-slate-700 dark:text-slate-200 font-medium">First Name</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Enter your first name"
                    className="mt-1 sm:mt-1.5 px-2 sm:px-3 py-1 sm:py-1.5 text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName" className="text-slate-700 dark:text-slate-200 font-medium">Last Name</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Enter your last name"
                    className="mt-1 sm:mt-1.5 px-2 sm:px-3 py-1 sm:py-1.5 text-sm"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="idNumber" className="text-slate-700 dark:text-slate-200 font-medium">Password (6-8 digits)</Label>
                <Input
                  id="idNumber"
                  type="password"
                  value={idNumber}
                  onChange={(e) => {
                    // Only allow numeric input
                    if (/^\d*$/.test(e.target.value)) {
                      setIdNumber(e.target.value);
                    }
                  }}
                  maxLength={8}
                  placeholder="Create a numeric password"
                  className="mt-1 sm:mt-1.5 px-2 sm:px-3 py-1 sm:py-1.5 text-sm"
                />
                <p className="text-xs text-slate-500 mt-1">Password must be 6-8 digits (numbers only)</p>
              </div>
            </div>
          </div>
        </section>

        <Separator className="my-6" />
        
        {/* Finish Onboarding Button */}
        <section className="mb-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-6 text-center">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Complete Your Onboarding</h3>
            
            {registrationError && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-400 dark:border-red-600 rounded-lg shadow-sm">
                <h4 className="font-semibold text-red-700 dark:text-red-400 mb-1 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Validation failed
                </h4>
                <p className="text-sm text-red-600 dark:text-red-400">{registrationError}</p>
              </div>
            )}
            
            {/* Progress bar removed to streamline UI */}
            
            <Button
              disabled={!allPoliciesAgreed || !allToolsChecked || !firstName || !lastName || !idNumber || isRegistering}
              className="w-full sm:w-auto sm:min-w-[200px] py-6 text-lg font-semibold transition-all bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white"
              onClick={handleFinishOnboarding}
              size="lg"
            >
              {isRegistering ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                "Complete Onboarding"
              )}
            </Button>
            
            {(!allPoliciesAgreed || !allToolsChecked || !firstName || !lastName || !idNumber) && !registrationError && (
              <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/30 rounded-lg">
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  Please complete all required steps before proceeding.
                </p>
                <ul className="mt-2 text-xs text-amber-600 dark:text-amber-400 space-y-1">
                  {!allPoliciesAgreed && <li>• Acknowledge all policies</li>}
                  {!allToolsChecked && <li>• Complete tool setup checklist</li>}
                  {!firstName || !lastName || !idNumber ? <li>• Fill in all personal details</li> : null}
                </ul>
              </div>
            )}
          </div>
        </section>

        <Separator className="my-4" />

        {/* Modern Footer */}
        <footer className="mt-4 mb-8 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-6 text-center">
            <div className="inline-flex items-center justify-center p-1.5 px-3 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 font-medium text-sm mb-2">
              INUA AI SOLUTIONS LTD.
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Welcome to the Team!</h3>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-4 text-sm">
              We're excited to have you on board. Here's to smooth systems, secure workflows, and smart solutions.
            </p>
            <a
              href="http://help.inuaai.net"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white transition-colors"
            >
              <LifeBuoy className="h-5 w-5 mr-2" />
              Visit Our Support Portal
            </a>
          </div>
        </footer>

      </div>
    </div>
  );
}