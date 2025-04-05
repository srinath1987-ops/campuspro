# CampusPro Bus Management System

CampusPro is a modern, responsive web application designed to streamline bus transportation management for educational institutions. It provides real-time tracking, student counting, and comprehensive reporting for campus transportation services.

![CampusPro Logo](https://iili.io/37Iga6u.png)

## Features

### For Administrators

- **Dashboard Overview**: Get a bird's-eye view of all buses with real-time status, location, and student count.
- **Driver Management**: Add, edit, and manage driver profiles and assignments.
- **Bus Management**: Track and manage your fleet with detailed information.
- **Reports**: Generate comprehensive reports on bus usage, student counts, and route efficiency.
- **Feedback Management**: View and respond to feedback submitted by users.

### For Drivers

- **Real-time Updates**: Update bus status (in/out of campus) and student counts.
- **Route Information**: Access detailed route information including stops and schedules.
- **Profile Management**: Update personal information and contact details.

### For Students/Users

- **Bus Tracking**: View real-time bus locations and expected arrival times.
- **Bus Schedule**: Access comprehensive bus schedules and route information.
- **Feedback Submission**: Submit feedback or report issues with the transportation service.

## Technology Stack

- **Frontend**: React.js with TypeScript
- **UI Framework**: Custom components with Tailwind CSS
- **State Management**: Redux Toolkit
- **Backend**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Hosting**: Vercel/Netlify/Your preferred hosting

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/campuspro.git
   cd campuspro
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with the following variables:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Build for production:
   ```bash
   npm run build
   ```

## Project Structure

```
campuspro/
├── public/             # Static assets
├── src/
│   ├── components/     # Reusable UI components
│   ├── contexts/       # React contexts
│   ├── hooks/          # Custom React hooks
│   ├── integrations/   # Third-party service integrations
│   ├── lib/            # Utility functions and helpers
│   ├── pages/          # Page components
│   │   ├── admin/      # Admin dashboard pages
│   │   ├── driver/     # Driver dashboard pages
│   │   └── public/     # Public-facing pages
│   ├── redux/          # Redux state management
│   └── styles/         # Global styles
└── scripts/            # Utility scripts for database setup
```

## Database Schema

The application uses the following primary tables:

- `profiles`: User profiles with roles (admin, driver, user)
- `bus_details`: Information about each bus in the fleet
- `bus_routes`: Route information for each bus
- `bus_student_count`: Daily student count records
- `feedback`: User-submitted feedback

## Authentication and Authorization

CampusPro uses role-based access control:

- **Administrators**: Full access to all features
- **Drivers**: Access to driver dashboard and related features
- **Users**: Access to public features and feedback submission

## Theming

The application supports both light and dark modes with a consistent design language across all interfaces.

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Icons provided by [Lucide Icons](https://lucide.dev/)
- UI components inspired by [shadcn/ui](https://ui.shadcn.com/)
- Charts powered by [Recharts](https://recharts.org/)
