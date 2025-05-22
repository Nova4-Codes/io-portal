# IO Portal Changelog

## May 21, 2025 (Evening Update 4 - Dedicated IT Maintenance Calendar)

### New Feature: IT Maintenance Calendar System
- **Database Schema**:
    - Added `MaintenanceEvent` model to `prisma/schema.prisma` to store structured data for maintenance events (title, description, start/end dates, type, author).
    - Added `MaintenanceEventType` enum (`PREVENTIVE_MAINTENANCE`, `REGULAR_UPDATE`, `EMERGENCY_MAINTENANCE`, `SERVICE_DEPLOYMENT`, `OTHER`).
    - Ran `npx prisma migrate dev --name add_maintenance_events` to apply schema changes.
- **Admin Dashboard - Maintenance Calendar Tab**:
    - Created a new "Maintenance Calendar" tab in the Admin Dashboard.
    - Implemented `MaintenanceSchedulerSection.tsx` component for full CRUD (Create, Read, Update, Delete) management of `MaintenanceEvent` records.
    - UI includes a table to display events and a dialog form with date/time pickers for creating/editing events. (*Note: Date picker interaction within the form is currently under review and being debugged.*)
- **API Endpoints**:
    - Created `POST` and `GET` (all events for admin, upcoming/active for public) endpoint at `/api/admin/maintenance/route.ts`.
    - Created dynamic `GET` (single event), `PUT`, and `DELETE` endpoints at `/api/admin/maintenance/[eventId]/route.ts`.
- **Employee-Facing IT Calendar Page (`/it-calendar`)**:
    - Overhauled the page to dynamically fetch and display maintenance events from the new API.
    - Shows "Upcoming Maintenance" and "Recent Past Maintenance" sections.
    - Uses distinct icons for different `MaintenanceEventType` values.
    - Removed previous hardcoded logic for displaying maintenance schedules.
- **Documentation**:
    - Updated `README.md` and `CHANGELOG.md` to reflect the new dedicated maintenance calendar system.

## May 21, 2025 (Evening Update 3 - Maintenance Scheduling & Display - *Superseded by Update 4*)

### Employee Dashboard Enhancements
- **Upcoming Maintenance Display**:
    - Added a new, prominent section on the employee dashboard to display "Upcoming Maintenance" schedules.
    - Maintenance events are identified by announcements with a "MAINTENANCE:" prefix in their title.
    - This section is displayed above general IT announcements if maintenance is scheduled.
    - Uses the `CalendarDays` icon for visual distinction.

### Admin Features
- **Maintenance Scheduling via Announcements**:
    - Admins can now schedule and communicate preventive maintenance by creating a standard announcement with the title prefixed by `MAINTENANCE:`.
    - These specially prefixed announcements are automatically filtered and highlighted on the employee dashboard.

## May 21, 2025 (Evening Update 2 - Admin Dashboard UX & User Deletion)

### Admin Dashboard Enhancements
- **UI/UX Overhaul**:
    - Implemented a tabbed interface (`Tabs` component) to separate "Employee Management", "Announcements", and "Login Attempts" sections, significantly de-cluttering the main view.
    - Simplified the "Employee Management" tab:
        - Removed individual "Policies" and "Tools" progress columns from the employee table. The "Status" column (Complete/Pending) now serves as the general onboarding completion indicator.
        - Removed the "Onboarding Pending" summary card. Summary cards now show "Total Employees" and "Onboarding Complete".
        - Adjusted summary card grid from 3 to 2 columns.
- **User Deletion Functionality**:
    - Added a "Delete" button to each employee row in the "Employee Management" tab.
    - Implemented an `AlertDialog` for confirming user deletion to prevent accidental data loss.
    - Created a new API endpoint `DELETE /api/admin/users/[userId]` to handle user deletion requests on the backend.
        - Includes admin authorization check (currently using mock authentication).
        - Prevents admins from deleting their own accounts via this endpoint.
        - Handles Prisma errors for "record not found" and "foreign key constraint violations".
- **Progress Component Update**:
    - Modified the `Progress` UI component (`src/components/ui/progress.tsx`) to accept an `indicatorClassName` prop, allowing dynamic styling of the progress bar (e.g., green for complete, orange for pending).

### Code Refactoring & Optimization (Continued)
- **Onboarding Page (`src/app/onboarding/page.tsx`)**:
  - Extracted helper functions `getIconForPolicyItem` and `renderMarkdownContent` into `src/lib/onboardingUtils.tsx`.
  - Extracted the Welcome Animation into a new component: `src/components/features/WelcomeAnimation.tsx`.
  - Reduced file length from over 684 lines to 480 lines.
- **Admin Dashboard (`src/app/admin/dashboard/page.tsx`)**:
  - Previously extracted "Announcements" and "Login Attempts" sections.
  - Major refactoring to implement the new tabbed layout and user deletion functionality.
- **Auth Context (`src/context/AuthContext.tsx`)**:
  - Simplified logic within `agreePolicy` and `checkTool` functions.
  - Reduced file length from 250 lines to 247 lines.
- **General Code Review**:
  - Reviewed other key files (`register/route.ts`, `login/route.ts`, `dashboard/page.tsx`, `utils.tsx`) for length and complexity; no major refactoring was immediately required for these.
  - Ensured files exceeding 500 lines were broken down or optimized.

---

## May 21, 2025

### Admin Dashboard Enhancements
- **Announcements Management**:
  - Implemented full CRUD (Create, Read, Update, Delete) functionality for IT announcements.
  - Admins can set announcements as active/inactive.
  - (Note: Delete functionality for announcements is currently being debugged).
- **Login Attempts Viewer**:
  - Added a new section to display a table of recent login attempts to the portal.
  - Shows timestamp, identifier used, IP address, success/failure status, and associated user.
- **Employee List UI Refactor**:
  - Changed the display of the employee list from a grid of cards to a more compact and scannable table view.
  - Simplified information on employee cards/rows for better clarity.

### Employee Dashboard
- **Dynamic Announcements**: The "IT Announcements" section now fetches and displays active announcements from the database.

### API & Backend
- **Login Attempt Logging**: The `/api/auth/login` endpoint now records all login attempts (successful and failed) to the database.
- **New API Endpoints**:
  - Added `/api/admin/announcements` (GET, POST) for managing collections of announcements.
  - Added `/api/admin/announcements/[id]` (GET, PUT, DELETE) for operations on individual announcements.
  - Added `/api/admin/login-attempts` (GET) to retrieve login attempt logs.

### Bug Fixes & Minor Improvements
- **Admin Login**: Resolved an issue on the login page where the password field incorrectly restricted admin users to numeric input only.
- **Announcement Creation**: Fixed several issues preventing announcements from being created and displayed correctly.
- **TypeScript & Prisma**: Addressed various TypeScript type errors, particularly related to Prisma Client regeneration after schema changes.
- **UI Component Installation**: Added missing shadcn/ui components (Dialog, Textarea, Switch, Calendar, Popover) and resolved related dependency issues.

---

## May 20, 2025

### Dashboard Improvements

- **Redesigned Header**:
  - Added a more compact header with search functionality
  - Added quick action buttons for notifications and settings
  - Improved welcome banner with user role and last login information

- **Quick Stats Row**:
  - Removed storage usage card
  - Updated system updates information to show weekly Monday updates
  - Retained IT tickets information card

- **Quick Actions Section**:
  - Implemented a 4-button grid for common tasks
  - Added "IT Policies" button linking to policy center
  - Added "Submit Ticket" button linking to ticketing system
  - Added "IT Calendar" button linking to maintenance schedule
  - Added "Resources" button linking to knowledge base
  - Removed "Profile Settings" and "Get Help" buttons

- **IT Announcements Section**:
  - Added a dedicated section for important IT announcements
  - Included recent updates about email security and password policy changes

- **Improved Layout Structure**:
  - Implemented a responsive 3-column layout that adapts to all screen sizes
  - Better organized content with logical grouping of related information

### New Pages

- **IT Calendar Page**:
  - Created a dedicated page for viewing maintenance schedules
  - Added preventive maintenance information (every 4 months on Sundays, last one on May 11, 2025)
  - Added weekly system updates schedule (every Monday)
  - Included maintenance notes and expectations

- **Knowledge Base Page**:
  - Created a comprehensive IT troubleshooting resource
  - Implemented search functionality for finding specific solutions
  - Added category filtering for better organization
  - Included 8 detailed troubleshooting guides for common issues:
    - Wi-Fi Connectivity Issues
    - Printer Troubleshooting
    - Email Access Problems
    - Display and Monitor Issues
    - Storage and File Access
    - Computer Performance
    - When to Restart Your Device
    - Password Management

### Onboarding Page Improvements

- **Removed Progress Bars**:
  - Eliminated all progress indicators for a cleaner interface
  - Removed individual module progress bars
  - Removed the overall progress bar
  - Removed the tools checklist progress bar

- **Optimized Spacing**:
  - Reduced vertical margins between sections
  - Decreased padding within cards and sections
  - Improved internal spacing between elements

- **Enhanced Mobile Responsiveness**:
  - Implemented flex-column layout for mobile screens
  - Reduced padding inside form fields on mobile
  - Optimized spacing for different screen sizes

### Login Page Improvements

- **Password Recovery**:
  - Added "Forgot your password?" link directing to IT Support

- **Improved Text Copy**:
  - Enhanced onboarding completion message with clearer language
  - Updated text to be more conversational and user-friendly

### Password System Improvements

- **Simplified Password Requirements**:
  - Changed from "ID Number" to "Password" terminology throughout the application
  - Implemented 6-8 digit numeric password requirement
  - Added client-side validation to only allow numeric input
  - Enhanced security by masking password input
  - Updated validation error messages to be more descriptive