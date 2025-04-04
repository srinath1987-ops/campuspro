# Campus Bus Pro

A modern campus bus management system with feedback features and role-based access. The system includes profiles for administrators, drivers, and public-facing components for students.

## Features

- 🚌 Real-time bus tracking and management
- 👤 Role-based access (Admin, Driver, Public)
- 🎨 Modern UI with light and dark mode
- 📱 Fully responsive design
- 📝 Student feedback system
- 📊 Admin analytics dashboard
- 🔒 Secure authentication with Supabase

## Database Setup

### Option 1: Using the included script

To set up the required database tables:

1. Run the SQL script in the Supabase SQL Editor:
   - Open your Supabase dashboard
   - Navigate to SQL Editor
   - Copy and paste the contents of `scripts/create_missing_tables.sql`
   - Click Execute

This will create:
- Feedback table with proper RLS policies
- Storage bucket for profile images with appropriate security policies

### Option 2: Using Supabase CLI

If you have the Supabase CLI configured:

```bash
npm run apply-schema
```

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables in `.env`:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

## Technology Stack

- React with TypeScript
- Tailwind CSS for styling
- Redux for state management
- Supabase for backend services
- Vite as the build tool

## Project info

**URL**: https://lovable.dev/projects/08c72bd9-97de-493d-b90b-431cc8feb8c2

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/08c72bd9-97de-493d-b90b-431cc8feb8c2) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/08c72bd9-97de-493d-b90b-431cc8feb8c2) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes it is!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
