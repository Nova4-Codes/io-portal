import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import React from 'react'; // Added React import

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Markdown Rendering Logic ---
export interface RenderedPolicyGroup { // Exported interface
  text: string;
  subItems: string[];
}

export const renderMarkdownContent = (contentLines: string[] | undefined): React.ReactNode => { // Added undefined check and React.ReactNode return type
  if (!contentLines || contentLines.length === 0) return null;

  const structuredItems: RenderedPolicyGroup[] = [];
  let currentTopLevelItem: RenderedPolicyGroup | null = null;

  contentLines.forEach((line) => {
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
        // Handle orphan sub-item (treat as top-level for robustness)
        structuredItems.push({ text: text, subItems: [] });
      }
    } else {
      // Finish previous top-level item
      if (currentTopLevelItem) {
        structuredItems.push(currentTopLevelItem);
      }
      // Start new top-level item
      currentTopLevelItem = { text: text, subItems: [] };
    }
  });

  // Add the last processed top-level item
  if (currentTopLevelItem) {
    structuredItems.push(currentTopLevelItem);
  }

  return (
    <ul className="list-none m-0 p-0 space-y-1.5">
      {structuredItems.map((item, index) => (
        <li key={`policy-group-${index}`}>
          <div className="flex items-start">
            {/* Using a simple bullet point for now, can be enhanced with icons if needed */}
            <span className="mr-2 mt-1 text-primary flex-shrink-0">&#8227;</span>
            <span
              className="text-sm text-slate-800 dark:text-slate-200 flex-1"
              dangerouslySetInnerHTML={{ __html: item.text }}
            />
          </div>
          {item.subItems.length > 0 && (
            <ul className="list-none m-0 p-0 pl-6 mt-1 space-y-1">
              {item.subItems.map((subItemText, subIndex) => (
                <li key={`sub-item-${index}-${subIndex}`} className="flex items-start">
                  <span className="mr-2 mt-1 text-slate-500 flex-shrink-0">&#8227;</span>
                  <span
                    className="text-sm text-slate-700 dark:text-slate-300 flex-1"
                    dangerouslySetInnerHTML={{ __html: subItemText }}
                  />
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  );
};
// --- End Markdown Rendering Logic ---
