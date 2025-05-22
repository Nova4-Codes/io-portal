"use client";

import React, { useState, useEffect, useMemo } from 'react'; // Added useState, useEffect, useMemo
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input'; // Added Input
import { ArrowLeft, ShieldCheck, Search, FileText, ChevronDown, ChevronUp } from 'lucide-react'; // Added Search, FileText, Chevrons
import { allPolicies, policyModulesData, PolicyInfo, PolicyModuleConfig } from '@/data/dashboardConstants'; // Import policy and module data
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { renderMarkdownContent, RenderedPolicyGroup } from '@/lib/utils'; // Import from utils

// Local interface for a policy with its module display title
interface PolicyWithModule extends PolicyInfo {
  moduleTitle: string;
}

// Interface for modules with their policies for rendering
interface RenderableModule extends PolicyModuleConfig {
  policies: PolicyInfo[];
}


export default function PolicyCenterPage() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [openAccordionItems, setOpenAccordionItems] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false); // State to track if component has mounted

  // Effect to set mounted to true after initial render
  useEffect(() => {
    setMounted(true);
  }, []);

  // Effect for redirection, only runs if mounted and not logged in
  useEffect(() => {
    if (mounted && !isLoggedIn) {
      router.push('/login');
    }
  }, [mounted, isLoggedIn, router]);

  // Prepare data by mapping policies to their modules
  const modulesWithPolicies = useMemo(() => {
    return policyModulesData.map(module => ({
      ...module,
      policies: module.policyIds.map(id => allPolicies.find(p => p.id === id)).filter(p => p !== undefined) as PolicyInfo[]
    }));
  }, []); // Depends only on static data

  const filteredModules = useMemo(() => {
    if (!searchTerm.trim()) {
      // If no search term, return all modules with their policies
      setOpenAccordionItems([]); // Collapse all when search is cleared
      return modulesWithPolicies;
    }

    const lowerSearchTerm = searchTerm.toLowerCase();
    const filtered = modulesWithPolicies.map(module => {
      const matchedPolicies = module.policies.filter(policy =>
        policy.title.toLowerCase().includes(lowerSearchTerm) ||
        policy.content.some(line => line.toLowerCase().includes(lowerSearchTerm))
      );
      return { ...module, policies: matchedPolicies };
    }).filter(module => module.policies.length > 0);
    
    // Automatically open accordions of policies that match the search
    const newOpenItems: string[] = [];
    filtered.forEach(module => {
      module.policies.forEach(policy => newOpenItems.push(policy.id));
    });
    setOpenAccordionItems(newOpenItems);

    return filtered;
  }, [searchTerm, modulesWithPolicies]);

  // If the component is not yet mounted, return null.
  // This prevents the client from rendering a different initial UI (e.g., redirect message)
  // than the server, which can cause hydration errors.
  if (!mounted) {
    return null; // Or a minimal loading skeleton if preferred
  }

  // If mounted but not logged in, show redirecting message
  // (actual redirection is handled by the useEffect above)
  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-900">
        <p className="text-lg text-muted-foreground">Redirecting to login...</p>
      </div>
    );
  }

  // If mounted and logged in, render the actual page content
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-8"> {/* Increased max-width */}
        
        {/* Header */}
        <header className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 dark:bg-blue-900/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none"></div>
          
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4 relative z-10">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => router.push('/dashboard')}
                  aria-label="Back to Dashboard"
                  className="hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="inline-block px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-medium">
                  INUA AI SOLUTIONS LTD.
                </div>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
                IT Policy Center
              </h1>
            </div>
            <div className="relative w-full sm:w-72">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 p-1 rounded-full bg-blue-100 dark:bg-blue-900/30">
                <Search className="h-3 w-3 text-blue-600 dark:text-blue-400" />
              </div>
              <Input
                type="search"
                placeholder="Search policies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full border-blue-200 dark:border-blue-900/30 focus:ring-blue-500 dark:focus:ring-blue-400"
              />
            </div>
          </div>
        </header>

        {/* Policy Modules & Accordion */}
        {filteredModules.length > 0 ? (
          filteredModules.map(module => (
            <Card key={module.id} className="shadow-lg border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all duration-300 group relative overflow-hidden mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 dark:from-blue-500/10 dark:to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardHeader className="bg-white dark:bg-slate-800 rounded-t-lg border-b dark:border-slate-700 relative z-10">
                <CardTitle className="flex items-center text-xl font-semibold text-slate-800 dark:text-slate-100">
                  <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30 mr-3">
                    <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  {module.displayTitle}
                </CardTitle>
                <CardDescription className="pt-1 text-sm">
                  {module.displayTitle} module
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Accordion type="multiple" value={openAccordionItems} onValueChange={setOpenAccordionItems} className="w-full">
                  {module.policies.map((policy: PolicyInfo) => ( // Added PolicyInfo type
                    <AccordionItem
                      value={policy.id}
                      key={policy.id}
                      className="border-b dark:border-slate-700 last:border-b-0 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors"
                    >
                      <AccordionTrigger
                        className="text-base font-medium hover:no-underline py-4 px-4 sm:px-6 text-slate-700 dark:text-slate-200 text-left flex justify-between items-center group"
                      >
                        <div className="flex items-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2 opacity-0 group-data-[state=open]:opacity-100 transition-opacity"></div>
                          <span dangerouslySetInnerHTML={{
                            __html: searchTerm ? policy.title.replace(new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'), '<mark class="bg-blue-200 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 px-0.5 rounded">$1</mark>') : policy.title
                          }} />
                        </div>
                        <ChevronDown className="h-4 w-4 shrink-0 text-blue-500 dark:text-blue-400 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                      </AccordionTrigger>
                      <AccordionContent className="prose prose-sm dark:prose-invert max-w-none pt-4 pb-6 px-6 sm:px-8 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-700/50">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 p-4 rounded-lg border border-blue-100 dark:border-blue-900/20 mb-4">
                          {renderMarkdownContent(policy.content)}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="shadow-lg border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all duration-300">
            <CardContent className="p-8 text-center">
              <div className="inline-flex items-center justify-center p-4 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
                <Search className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-xl font-medium text-slate-800 dark:text-slate-100 mb-2">No policies found</p>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                Your search for "<span className="font-medium text-blue-600 dark:text-blue-400">{searchTerm}</span>" did not match any policies. Try a different keyword.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                onClick={() => setSearchTerm("")}
              >
                Clear Search
              </Button>
            </CardContent>
          </Card>
        )}

        <footer className="mt-16 text-center">
          <div className="inline-flex items-center justify-center p-2 px-4 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium text-xs mb-4">
            INUA AI SOLUTIONS LTD.
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">&copy; {new Date().getFullYear()} All rights reserved.</p>
        </footer>

      </div>
    </div>
  );
}