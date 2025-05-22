# IO Portal - Internal Application

This project is an internal application built using the Next.js framework.

## Tech Stack

* **Framework**: [Next.js](https://nextjs.org/) (App Router)
* **Language**: [TypeScript](https://www.typescriptlang.org/)
* **Styling**: [Tailwind CSS](https://tailwindcss.com/)
* **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
* **Database**: SQLite with [Prisma ORM](https://www.prisma.io/)
* **Authentication**: Custom JWT-less auth with bcrypt password hashing
* **Linting**: ESLint

## Current Features

1. **Authentication & User Registration (Database Backed)**:
   * **Database**: Uses SQLite with Prisma ORM for simplified deployment.
   *   **Login Page (`/login`)**:
       *   Users log in using their First Name, Last Name, and numeric Password (6-8 digits). Login logic performs a case-insensitive name check.
     * Features an optimized space-efficient design.
     * Includes a link to the onboarding page for new users.
     * Input validation via Zod on the backend.
     * On successful login, users are redirected to `/dashboard`.
     * Redirects logged-in users away from this page.
     * Provides clear guidance for users who just completed onboarding.
   * **Onboarding & Registration (`/onboarding`)**:
     * Accessed via `/onboarding?role=...`.
     *   Collects First Name, Last Name, and Password (validated for 6-8 numeric digits).
     * Requires agreement to all policies and completion of tool checklist.
     * Prevents duplicate user registration by checking both name and ID number.
     * On completion, calls `/api/auth/register` to save user data (with hashed ID number) to the database.
     * Triggers a welcome animation upon successful registration.
   * **API Routes**:
     * `POST /api/auth/register`: Handles user creation, password hashing (bcryptjs), and database storage via Prisma. Validates input using Zod. Includes duplicate user prevention.
     * `POST /api/auth/login`: Handles user lookup (case-insensitive name), password verification (bcryptjs), returns user data upon success, and records login attempts. Validates input using Zod.
   * **API Routes (Admin)**:
     * `GET, POST /api/admin/announcements`: For managing announcements.
     * `GET, PUT, DELETE /api/admin/announcements/[id]`: For specific announcement operations.
     * `GET /api/admin/login-attempts`: For fetching login attempt logs.
     * `GET, POST /api/admin/maintenance`: For managing IT maintenance events.
     * `GET, PUT, DELETE /api/admin/maintenance/[eventId]`: For specific maintenance event operations.
   * **Authentication Context (`AuthContext`)**:
     * Manages active user session state (login status, user details fetched from API).
     * Calls login/register API endpoints.
     * Provides logout functionality.
     * Persists active session state in `localStorage` for browser session continuity.
     * Improved error handling with specific error messages.

2. **Onboarding Page (`/onboarding`)**:
   * Displays a detailed header: "INUA AI SOLUTIONS LTD. - IT DEPARTMENT ORIENTATION / ONBOARDING GUIDE".
   * Includes introductory text and a link to the helpdesk.
   * Shows an overall progress bar tracking completion of all policies and tools.
   * Presents IT information structured into 6 modules (5 policy modules, 1 tool checklist module).
   * Each module displays its title (e.g., "🚀 Module 1 of 6: Getting Set Up") and its own progress indicator.
   * Policy items within modules are displayed with relevant icons (`lucide-react`).
   * Each policy requires explicit acknowledgement via an "I Understand and Agree" button.
   * Module 6 contains the role-specific tool setup checklist using checkboxes.
   * Input fields for First Name, Last Name, and ID Number are provided for registration.
   * The "Finish Onboarding & Proceed" button is enabled only after all policies are agreed, all tools are checked, and user details are provided.
   * Includes a footer with a welcome message and helpdesk link.
   * Modern UI with subtle animations and visual feedback.

3. **Welcome Animation**:
   * Triggered after successfully completing onboarding and registration.
   * Displays a full-screen animated "Welcome To INUA AI SOLUTIONS LTD." message.
   * Enhanced with fluid motion graphics and subtle pulsing effects.
   * Includes a "Proceed to Login" button which redirects to the login page.
   * Clear instructions about using the same credentials for login.

4. **Dashboard Page (`/dashboard`)**:
   * Accessible only after a user logs in (redirects to `/login` otherwise).
   * Displays a prominent header: "INUA AI Employee Portal".
   * Shows a welcome message with the user's name and role.
   * Features a card linking to the dedicated "IT Policy Center" (`/policy-center`).
   * Displays the user's completed Tool Setup checklist with visual indicators.
   * **IT Announcements**: Shows general IT announcements.
   * Includes a "Tech Trivia" card with random IT facts.
   * Provides quick links to IT support (helpdesk, email) with enhanced visual design.
   * Includes a logout button.
   * Uses a professional blue color palette with strategic accent colors.
   * Card hover effects and subtle animations for better user experience.

5. **Policy Center Page (`/policy-center`)**:
   * Accessible only after a user logs in.
   * Groups policies by their respective modules (e.g., "Getting Set Up", "Staying Secure").
   * Includes a search bar to filter policies by title or content keywords.
   * Displays filtered policies within their modules using an Accordion component.
   * Highlights search terms within policy titles for easy identification.
   * Users can expand each policy to read its full content.
   * Includes a back button to return to the dashboard.
   * Space-optimized design with improved visual hierarchy.
   * Enhanced search experience with better highlighting.

6. **Admin Features**:
   * Admin user creation via the `create-admin.js` script.
   * Admin dashboard at `/admin/dashboard` with tabbed interface:
       * **Employee Management**: View and delete users.
       * **Announcements**: Full CRUD for IT announcements.
       * **Login Attempts**: View logs of login attempts.
       * **Maintenance Calendar**: Dedicated section for admins to create, edit, view, and delete scheduled IT maintenance events (e.g., Preventive Maintenance, System Updates). (*Note: Date picker interaction in the create/edit form is currently under review.*)

7. **IT Calendar Page (`/it-calendar`)**:
   * Dynamically displays upcoming and past IT maintenance events fetched from the database.
   * Categorizes events by type with distinct icons.
   * Replaces previous hardcoded maintenance schedule logic.

## Getting Started

To run the development server:

1. Navigate to the project directory:
   ```bash
   cd io-portal
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. **Setup Database**: The project uses SQLite by default, which requires minimal setup. Ensure your `.env` file contains:
   ```
   DATABASE_URL="file:./dev.db"
   ```
4. **Run Database Migrations**:
   ```bash
   npx prisma migrate dev
   ```
5. **Create an Admin User** (Optional):
   ```bash
   node create-admin.js
   ```
6. **Run the development server**:
   ```bash
   npm run dev
   ```
7. Open [http://localhost:3000](http://localhost:3000) with your browser. You will be redirected to `/login`. New users should click the link to go to `/onboarding?role=employee` first.

## Recent Improvements

* **UI Modernization**: Implemented a balanced blue color scheme with strategic accent colors.
* **Space Optimization**: Reduced unnecessary padding and margins throughout the interface.
* **Enhanced Security**: Added duplicate user prevention during registration.
* **Improved Error Handling**: Better error messages and recovery options.
* **Database Simplification**: Switched from PostgreSQL to SQLite for easier deployment.
* **Visual Feedback**: Added subtle animations and transitions for a more polished feel.
* **Responsive Design**: Ensured all pages work well on different screen sizes.

---

*This README will be updated as the project evolves.*

## Recent Improvements

* **UI Optimization**: Removed all progress bars (both individual module progress bars and the overall progress bar) to create a cleaner, more streamlined interface.
* **Space Efficiency**: Optimized spacing throughout the application by reducing excessive margins, padding, and vertical spacing while maintaining readability.
* **Enhanced Responsive Layout**: The application uses a combination of layout techniques optimized for all screen sizes:
  * Flex-column layout for mobile that switches to grid on larger screens
  * Reduced padding and margins on small viewports
  * Responsive typography and spacing that adapts to screen size
  * Tailwind's responsive utilities for consistent behavior across devices
* **Password Recovery**: Added a "Forgot your password?" link on the login page that directs users to IT Support for password recovery assistance.
* **Improved Text Copy**: Enhanced the onboarding completion message with clearer, more user-friendly language.
* **Simplified Password System**: Changed from ID Numbers to a straightforward 6-8 digit numeric password system with clear validation.
* **Enhanced Dashboard Layout**: Completely redesigned the employee dashboard with:
  * Compact header with search functionality and quick action buttons
  * System updates information (weekly Monday updates) and IT tickets status
  * Quick Actions grid for common tasks (IT Policies, Submit Ticket, IT Calendar, Resources)
  * **IT Announcements section now dynamically displays active announcements from the database.**
  * Responsive 3-column layout that adapts to all screen sizes
  * Improved spacing and visual hierarchy
* **IT Maintenance Calendar System**:
  * **Database**: Added `MaintenanceEvent` model and `MaintenanceEventType` enum to `prisma/schema.prisma`.
  * **Admin Interface**: New "Maintenance Calendar" tab in Admin Dashboard for full CRUD management of maintenance events (title, description, start/end dates, type). (*Note: Date picker interaction in the create/edit form is currently under review and being debugged.*)
  * **API Endpoints**: Created `/api/admin/maintenance` and `/api/admin/maintenance/[eventId]` for backend operations.
  * **Employee View**: The `/it-calendar` page now dynamically fetches and displays these scheduled events, replacing the previous hardcoded display.
* **New Knowledge Base Page**: Added a comprehensive IT troubleshooting resource:
  * Searchable troubleshooting guides for common issues
  * Category filtering for better organization
  * Detailed step-by-step solutions
  * Direct links to support resources
* **Comprehensive Changelog**: Added a detailed CHANGELOG.md file documenting all improvements and modifications
* **Admin Dashboard Enhancements**:
    * Implemented a tabbed interface (Employee Management, Announcements, Login Attempts, Maintenance Calendar) for a cleaner and more organized layout.
    * Added User Deletion: Admins can now delete users from the "Employee Management" tab, with a confirmation dialog.
    * Simplified Employee View: Removed detailed policy/tool progress, focusing on overall onboarding status.
    * Simplified Summary: Removed "Pending Onboarding" card for a more concise overview.
    * Added full CRUD functionality for IT Announcements.
    * Implemented a viewer for recent login attempts.
    * Refactored the employee list on the admin dashboard to a table view for better clarity and space management.
* **Login Page**: Fixed an issue where the password field incorrectly restricted admin users to numeric input.
* **Validation Error Handling**: Fixed an issue where validation errors during registration weren't properly displayed to users.
* **Error Message Formatting**: Improved the display of validation error messages to make them more visible and informative.
* **Code Refactoring & Optimization (May 21, Evening)**:
    *   **Onboarding Page**: Refactored by extracting helper functions ([`getIconForPolicyItem`](io-portal/src/lib/onboardingUtils.tsx:1), [`renderMarkdownContent`](io-portal/src/lib/onboardingUtils.tsx:1)) to [`src/lib/onboardingUtils.tsx`](io-portal/src/lib/onboardingUtils.tsx:1) and the Welcome Animation to [`src/components/features/WelcomeAnimation.tsx`](io-portal/src/components/features/WelcomeAnimation.tsx:1). Reduced file length significantly.
    *   **Admin Dashboard**: Refactored by extracting the "Announcements" section to [`src/components/admin/AnnouncementsSection.tsx`](io-portal/src/components/admin/AnnouncementsSection.tsx:1) and the "Login Attempts" section to [`src/components/admin/LoginAttemptsSection.tsx`](io-portal/src/components/admin/LoginAttemptsSection.tsx:1). Further refactored to use a tabbed layout.
    *   **Auth Context**: Optimized `agreePolicy` and `checkTool` functions for simplicity.
    *   Reviewed and ensured other key components and API routes are within reasonable complexity and length.
