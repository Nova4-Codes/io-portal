import React from 'react';
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

// --- Helper Function for Icons ---
export const getIconForPolicyItem = (policyId: string, index: number, isSubItem: boolean): React.ElementType => {
  if (isSubItem) {
      // Icons for specific known sub-items
      if (policyId === 'm3p1') {
          switch (index) { case 3: return Wrench; case 4: return DownloadCloud; case 5: return HelpCircle; default: return ChevronRight; }
      }
       if (policyId === 'm5p3') {
          switch (index) { case 1: return LifeBuoy; case 2: return MailCheckIcon; default: return ChevronRight; }
      }
       if (policyId === 'm4p1' && index === 1) return Clock;
      // Default for other sub-items (usually none needed, but ChevronRight as fallback)
      return ChevronRight;
  }

  // Icons for top-level items
  switch (policyId) {
    case 'm1p1':
      switch (index) { case 0: return UserCheck; case 1: return LogIn; case 2: return KeyRound; default: return ChevronRight; }
    case 'm1p2':
      switch (index) { case 0: return Laptop; case 1: return Lock; case 2: return ShieldAlert; case 3: return Wrench; default: return ChevronRight; }
    case 'm1p3':
      switch (index) { case 0: return ShieldCheck; case 1: return Smartphone; case 2: return HelpCircle; default: return ChevronRight; }
    case 'm2p1':
      switch (index) { case 0: return MailQuestion; case 1: return FileX; case 2: return Monitor; default: return ChevronRight; }
    case 'm2p2':
      switch (index) { case 0: return Ban; case 1: return AlertTriangle; default: return ChevronRight; }
    case 'm2p3':
      switch (index) { case 0: return Usb; case 1: return Scan; case 2: return WifiOff; default: return ChevronRight; }
    case 'm2p4':
      switch (index) { case 0: return FileText; case 1: return ShieldQuestion; case 2: return Trash2; default: return ChevronRight; }
    case 'm3p1':
      switch (index) { case 0: return LifeBuoy; case 1: return LogIn; case 2: return ListTodo; default: return ChevronRight; } // Sub-item icons handled above
    case 'm3p2':
      switch (index) { case 0: return Ban; case 1: return Ticket; default: return ChevronRight; }
    case 'm3p3':
      switch (index) { case 0: return Wifi; case 1: return Route; default: return ChevronRight; }
    case 'm3p4':
      switch (index) { case 0: return Cloud; case 1: return CopyX; default: return ChevronRight; }
    case 'm4p1':
      switch (index) { case 0: return Settings; case 2: return ShieldCheck; default: return ChevronRight; } // Sub-item icon handled above
    case 'm4p2':
      switch (index) { case 0: return Server; case 1: return DatabaseBackup; case 2: return History; default: return ChevronRight; }
    case 'm4p3':
      switch (index) { case 0: return FileCog; case 1: return ShieldAlert; default: return ChevronRight; }
    case 'm5p1':
      switch (index) { case 0: return PhoneCall; case 1: return Clock; default: return ChevronRight; }
    case 'm5p2':
      switch (index) { case 0: return KeyRound; case 1: return Network; case 2: return Printer; default: return ChevronRight; }
    case 'm5p3':
      switch (index) { case 0: return MessageCircleQuestion; case 3: return GraduationCap; default: return ChevronRight; } // Sub-item icons handled above
    default:
      return ChevronRight;
  }
};

// --- Corrected Rendering Function for Nested Lists ---
interface RenderedPolicyGroup {
  icon: React.ElementType;
  text: string; // Formatted top-level text
  originalIndex: number;
  subItems: string[]; // Array of formatted sub-item texts
}

export const renderMarkdownContent = (policyId: string, contentLines: string[]): React.ReactNode => {
  if (!contentLines || contentLines.length === 0) return null;

  // 1. Structure the data
  const structuredItems: RenderedPolicyGroup[] = [];
  let currentTopLevelItem: RenderedPolicyGroup | null = null;

  contentLines.forEach((line, index) => {
    const isSubItem = line.startsWith('* ');
    let text = isSubItem ? line.substring(2) : line;

    // Apply markdown formatting
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/`(.*?)`/g, '<code>$1</code>');
    text = text.replace(
      /\[(.*?)\]\((.*?)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">$1</a>'
    );

    if (isSubItem) {
      if (currentTopLevelItem) {
        currentTopLevelItem.subItems.push(text);
      } else {
        // Handle orphan sub-item (should ideally not happen with correct data)
        // Treat it as a top-level item for robustness
        const IconComponent = getIconForPolicyItem(policyId, index, true);
        structuredItems.push({
          icon: IconComponent,
          text: text,
          originalIndex: index,
          subItems: []
        });
      }
    } else {
      // Finish previous top-level item
      if (currentTopLevelItem) {
        structuredItems.push(currentTopLevelItem);
      }
      // Start new top-level item
      const IconComponent = getIconForPolicyItem(policyId, index, false);
      currentTopLevelItem = {
        icon: IconComponent,
        text: text,
        originalIndex: index,
        subItems: []
      };
    }
  });
  // Add the last processed top-level item
  if (currentTopLevelItem) {
    structuredItems.push(currentTopLevelItem);
  }

  // 2. Render the structured data
  return (
    <ul className="list-none m-0 p-0 space-y-1.5"> {/* Base list styling */}
      {structuredItems.map((item: RenderedPolicyGroup) => { // Added type
        const IconComponent = item.icon;
        const iconColor = "text-blue-600";

        return (
          <li key={`policy-group-${item.originalIndex}`}>
            {/* Top-level item */}
            <div className="flex items-center">
              <IconComponent className={`h-5 w-5 mr-3 flex-shrink-0 ${iconColor}`} aria-hidden="true" />
              <span
                className="text-sm text-slate-800 dark:text-slate-200 flex-1"
                dangerouslySetInnerHTML={{ __html: item.text }}
              />
            </div>

            {/* Nested list for sub-items */}
            {item.subItems.length > 0 && (
              <ul className="list-none m-0 p-0 pl-8 mt-1.5 space-y-1.5"> {/* Indented nested list */}
                {item.subItems.map((subItemText: string, subIndex: number) => { // Added types
                   // Decide if sub-items get icons (using getIcon helper)
                   // const SubIconComponent = getIconForPolicyItem(policyId, item.originalIndex + 1 + subIndex, true);
                   return (
                     <li key={`sub-item-${item.originalIndex}-${subIndex}`} className="flex items-center">
                       {/* Render a sub-icon or just a spacer */}
                       {/* <SubIconComponent className="h-4 w-4 mr-3 flex-shrink-0 text-slate-500" /> */}
                       <span className="w-5 mr-3 flex-shrink-0"></span> {/* Spacer to align */}
                       <span
                         className="text-sm text-slate-700 dark:text-slate-300 flex-1" // Slightly different style
                         dangerouslySetInnerHTML={{ __html: subItemText }}
                       />
                     </li>
                   );
                })}
              </ul>
            )}
          </li>
        );
      })}
    </ul>
  );
};