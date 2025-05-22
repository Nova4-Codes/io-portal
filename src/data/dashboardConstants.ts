// Data definitions for the dashboard page

// Updated interface to include content
export interface PolicyInfo {
  id: string;
  title: string;
  content: string[]; // Added content field
}
export interface ToolInfo {
  id: string;
  name: string;
}

// Renamed the old list, might not be needed anymore but keeping for reference just in case
export const allPolicyTitles: Omit<PolicyInfo, 'content'>[] = [
  { id: 'm1p1', title: '1. Domain Account & Email'},
  { id: 'm1p2', title: '2. Machine Basics & Handling'},
  { id: 'm1p3', title: '3. Multi-Factor Authentication (MFA)'},
  { id: 'm2p1', title: '1. Cybersecurity Awareness'},
  { id: 'm2p2', title: '2. Unsecure & Illegal Site Policy'},
  { id: 'm2p3', title: '3. External Devices & USB Rules'},
  { id: 'm2p4', title: '4. Data Classification & Handling'},
  { id: 'm3p1', title: '1. Zammad Ticketing Platform'},
  { id: 'm3p2', title: '2. Unauthorized Installation Policy'},
  { id: 'm3p3', title: '3. Wi‑Fi Access'},
  { id: 'm3p4', title: '4. Shadow IT & SaaS Policy'},
  { id: 'm4p1', title: '1. System Updates & Patch Management'},
  { id: 'm4p2', title: '2. Data Backups & Recovery'},
  { id: 'm4p3', title: '3. Change Requests & Incidents'},
  { id: 'm5p1', title: '1. After‑Hours Support'},
  { id: 'm5p2', title: '2. Common Troubleshooting'},
  { id: 'm5p3', title: '3. Continuous Learning & Feedback'},
];

// New constant holding the full policy details
export const allPolicies: PolicyInfo[] = [
    { id: 'm1p1', title: '1. Domain Account & Email', content: ["* Your domain account (e.g., `john.doe`) is your digital ID.", "* It gives you access to your workstation, official email, Zammad, and all internal systems.", "* 🔑 **Action**: Log in within 24 hours and update your temporary password."]},
    { id: 'm1p2', title: '2. Machine Basics & Handling', content: ["Your assigned device is tagged and traceable—treat it like company property.", "Always **lock your screen** (`Win+L` / `Ctrl+Cmd+Q`) when stepping away.", "Never share or write down your password.", "Physically and digitally maintain your machine—keep it clean and clutter-free."]},
    { id: 'm1p3', title: '3. Multi-Factor Authentication (MFA)', content: ["MFA is **strongly encouraged** for all systems.", "Enroll via your mobile authenticator or use SMS-based 2FA.", "If locked out, contact IT for recovery assistance."]},
    { id: 'm2p1', title: '1. Cybersecurity Awareness', content: ["Think before you click—verify email senders and links.", "Avoid opening files from unknown sources.", "All web traffic is monitored for safety and compliance."]},
    { id: 'm2p2', title: '2. Unsecure & Illegal Site Policy', content: ["🚫 Accessing illegal, adult, or unsecure sites is prohibited.", "Repeated violations can lead to account restrictions or disciplinary action."]},
    { id: 'm2p3', title: '3. External Devices & USB Rules', content: ["* Do not plug in personal USBs or external devices without IT clearance.", "* All approved devices must be scanned and registered.", "* Do not use mobile hotspots—connect to **INUAAI Reception Net (WPA2-Enterprise)** only."]},
    { id: 'm2p4', title: '4. Data Classification & Handling', content: ["Share **Internal** data via email or cloud platforms only.", "Any sensitive classification (Confidential/Restricted) requires prior IT approval.", "Always delete sensitive data securely."]},
    { id: 'm3p1', title: '1. Zammad Ticketing Platform', content: ["Our official support platform: [help.inuaai.net](http://help.inuaai.net)", "Use your domain credentials to log in.", "Submit tickets for:", "* Technical issues", "* Software/tool requests", "* Access or troubleshooting help"]},
    { id: 'm3p2', title: '2. Unauthorized Installation Policy', content: ["No installations allowed without IT review.", "Use Zammad to request apps/tools with purpose and vendor details."]},
    { id: 'm3p3', title: '3. Wi‑Fi Access', content: ["Connect only to **INUAAI Reception Net (WPA2-Enterprise)**.", "We do not use VPNs—local access is securely handled via domain authentication."]},
    { id: 'm3p4', title: '4. Shadow IT & SaaS Policy', content: ["All cloud-based or third-party apps require IT approval.", "Avoid duplicating software tools—IT manages licensing and access."]},
    { id: 'm4p1', title: '1. System Updates & Patch Management', content: ["Windows/macOS updates run automatically:", "* **Every Monday @ 4 PM and 10 AM (local time)**", "Critical patches are pushed as needed within 48 hours."]},
    { id: 'm4p2', title: '2. Data Backups & Recovery', content: ["**Critical servers** are backed up nightly.", "All backups follow IT Data Policy schedules.", "Restore drills are conducted quarterly for recovery assurance."]},
    { id: 'm4p3', title: '3. Change Requests & Incidents', content: ["Major IT/system changes require a Change Request (CR).", "Suspect a data breach or virus? Report immediately."]},
    { id: 'm5p1', title: '1. After‑Hours Support', content: ["Submit a Zammad ticket or directly call any IT team member.", "Emergency support window: up to 4 hours."]},
    { id: 'm5p2', title: '2. Common Troubleshooting', content: ["**Password issues?** Use Zammad or ask your team lead.", "**Network issues?** Check Wi-Fi/Ethernet icon, run speed test (>120 Mbps), and reboot.", "**Printer jam?** Contact IT to inspect the device."]},
    { id: 'm5p3', title: '3. Continuous Learning & Feedback', content: ["Got suggestions or spot an issue? Share it via:", "* [help.inuaai.net](http://help.inuaai.net)", "* [ITSUPPORTDESK@INUAAI.COM](mailto:ITSUPPORTDESK@INUAAI.COM)", "Stay tuned for monthly tips and optional learning sessions."]},
];


export const allToolDetails: ToolInfo[] = [
  { id: 't0_account', name: 'Domain Account & Password (Received/Set)' }, // Combined item
  // { id: 't0_domain', name: 'Domain Name (Received)' }, // Removed
  // { id: 't0_pass', name: 'Password (Set/Changed)' }, // Removed
  { id: 't1', name: 'Email Client (Titan/Gmail) Setup' },
  { id: 't_zammad', name: 'Zammad (IT Support Platform) Login Confirmed' },
  { id: 't_admin_iam', name: 'Admin: IAM Console Access Verified' }, // Will only show if user is admin and checked it
];

export const itFacts: string[] = [
  "The first computer mouse was made of wood.",
  "The QWERTY keyboard layout was designed to slow typists down to prevent typewriter jams.",
  "The term 'bug' for a computer glitch was popularized after a moth got stuck in a relay of the Harvard Mark II computer in 1947.",
  "The first gigabyte hard drive, IBM 3380, weighed over 550 pounds and cost $40,000 in 1980.",
  "Domain name registration was free until 1995.",
  "The average person blinks 20 times a minute, but only 7 times a minute when using a computer.",
  "Over 6,000 new computer viruses are created and released every month.",
  "The first webcam was used at Cambridge University to monitor a coffee pot.",
  "Approximately 90% of the world's currency only exists on computers.",
  "The Firefox logo isn't a fox – it's a red panda.",
  "The first computer “bug” was a real moth stuck in a relay at Harvard in 1947.",
  "The QWERTY keyboard was designed to slow typists down and prevent jamming.",
  "The world’s first webcam pointed at a coffee pot so researchers wouldn’t make a wasted trip.",
  "“CAPTCHA” stands for “Completely Automated Public Turing test to tell Computers and Humans Apart.”",
  "The first 1 GB hard drive (IBM, 1980) weighed over 500 lbs and cost $40,000.",
  "Over 90% of the world’s currency exists only as digital entries.",
  "The original “@” symbol choice for email was because it already meant “at” in commerce.",
  "Email is older than the World Wide Web—Ray Tomlinson sent the first email in 1971.",
  "There are more possible iterations of a game of chess than atoms in the known universe.",
  "The first computer virus was created in 1971 on ARPANET and was called “Creeper.”",
  "More than half of all internet traffic is generated by bots.",
  "The “blue screen of death” first appeared in Windows 1.0 in 1985.",
  "The term “bug” in software traces back to Thomas Edison’s lab notebooks.",
  "NASA still runs some missions on code written in the 1960s (Fortran and assembly).",
  "The “cloud” icon first appeared in 1993’s Symbolics LISP Machine interface.",
  "Only 8% of the world’s data has ever been analyzed.",
  "The first 1 KB RAM chip was introduced by Intel in 1970.",
  "Approximately 300 hours of video are uploaded to YouTube every minute.",
  "The first domain ever registered was symbolics.com on March 15, 1985.",
  "The world’s first webcam image (1993) helped track coffee levels at Cambridge Uni.",
  "The original IBM PC used an open-architecture BIOS that led to the rise of “IBM compatibles.”",
  "The first SMS message (“Merry Christmas”) was sent in 1992.",
  "95% of cybersecurity breaches are due to human error.",
  "CAPTCHA images often train machine‐learning algorithms while blocking bots.",
  "Around 60% of all emails sent daily are spam.",
  "The “USB” in USB stands for “Universal Serial Bus,” introduced in 1996.",
  "The term “Wi-Fi” has no official meaning—it’s just catchy branding.",
  "The first webcam ran on an Acorn Archimedes computer.",
  "Moore’s Law predicts transistor counts double roughly every two years—still roughly holds true.",
  "The average smartphone today has more computing power than the Apollo 11 guidance computer."
];

// --- Policy Module Definitions ---

export interface PolicyModuleConfig {
  id: string;
  displayTitle: string;
  policyIds: string[];
}

export const policyModulesData: PolicyModuleConfig[] = [
  { id: "mod1", displayTitle: "🚀 Module 1: Getting Set Up", policyIds: ["m1p1", "m1p2", "m1p3"] },
  { id: "mod2", displayTitle: "🔒 Module 2: Staying Secure", policyIds: ["m2p1", "m2p2", "m2p3", "m2p4"] },
  { id: "mod3", displayTitle: "🧰 Module 3: Tools & Support", policyIds: ["m3p1", "m3p2", "m3p3", "m3p4"] },
  { id: "mod4", displayTitle: "🛠️ Module 4: Maintenance & Backup", policyIds: ["m4p1", "m4p2", "m4p3"] },
  { id: "mod5", displayTitle: "❓ Module 5: Extras & FAQs", policyIds: ["m5p1", "m5p2", "m5p3"] },
  // Module 6 (Tools) is handled separately on the dashboard/onboarding
];