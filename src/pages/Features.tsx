
import React from 'react';
import { BusFront, Clock, Users, Bell, Shield, Smartphone, Database, Search, PenTool, UserPlus } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// Feature Card Component
const FeatureCard = ({ 
  icon: Icon, 
  title, 
  description 
}: { 
  icon: React.ComponentType<any>; 
  title: string; 
  description: string;
}) => (
  <div className="rounded-xl bg-white shadow-md p-6 transition-all hover:shadow-lg hover:-translate-y-1">
    <div className="mb-4 p-3 bus-gradient-bg rounded-full inline-block">
      <Icon className="h-6 w-6 text-white" />
    </div>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

const Features = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bus-hero-pattern py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 bus-gradient-text">
              Comprehensive Bus Tracking Features
            </h1>
            <p className="text-xl text-gray-600 mb-6">
              Our system offers a wide range of features designed to make campus transportation management efficient and hassle-free
            </p>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Key System Features</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explore the powerful capabilities of our IoT-enabled bus tracking system
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={BusFront} 
              title="Real-Time Bus Tracking" 
              description="Monitor bus location and status (inside or outside campus) in real-time with RFID technology."
            />
            <FeatureCard 
              icon={Clock} 
              title="Automatic Timestamping" 
              description="System automatically logs entry and exit times for comprehensive reporting and analysis."
            />
            <FeatureCard 
              icon={Users} 
              title="Student Count Management" 
              description="Easy interface for drivers to record and update daily student counts for each route."
            />
            <FeatureCard 
              icon={Bell} 
              title="Notification System" 
              description="Automated alerts and reminders for bus status, student count submissions, and system updates."
            />
            <FeatureCard 
              icon={Shield} 
              title="Role-Based Access Control" 
              description="Secure access system with separate admin and driver portals with appropriate privileges."
            />
            <FeatureCard 
              icon={Smartphone} 
              title="Mobile-Friendly Interface" 
              description="Responsive design ensures the system is accessible on any device, including smartphones."
            />
            <FeatureCard 
              icon={Database} 
              title="Comprehensive Data Management" 
              description="Store and manage all bus-related data in a centralized database for easy access and reporting."
            />
            <FeatureCard 
              icon={Search} 
              title="Advanced Search & Filtering" 
              description="Find specific information quickly with powerful search and filtering capabilities."
            />
            <FeatureCard 
              icon={PenTool} 
              title="Customizable Driver Profiles" 
              description="Manage driver details, assigned buses, and contact information in personalized profiles."
            />
          </div>
        </div>
      </section>
      
      {/* Admin vs Driver Features */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Role-Based Features</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our system provides tailored experiences for different users
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto">
            {/* Admin Features */}
            <div className="bg-white rounded-xl shadow-md p-8">
              <div className="mb-6 p-4 bus-gradient-bg rounded-full inline-flex">
                <UserPlus className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Admin Features</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <div className="mr-2 mt-1 text-primary">•</div>
                  <span>Comprehensive analytics dashboard</span>
                </li>
                <li className="flex items-start">
                  <div className="mr-2 mt-1 text-primary">•</div>
                  <span>Driver account management</span>
                </li>
                <li className="flex items-start">
                  <div className="mr-2 mt-1 text-primary">•</div>
                  <span>Bus fleet management</span>
                </li>
                <li className="flex items-start">
                  <div className="mr-2 mt-1 text-primary">•</div>
                  <span>Historical data reporting</span>
                </li>
                <li className="flex items-start">
                  <div className="mr-2 mt-1 text-primary">•</div>
                  <span>User access control</span>
                </li>
                <li className="flex items-start">
                  <div className="mr-2 mt-1 text-primary">•</div>
                  <span>System configuration options</span>
                </li>
                <li className="flex items-start">
                  <div className="mr-2 mt-1 text-primary">•</div>
                  <span>Complete student count records</span>
                </li>
              </ul>
            </div>
            
            {/* Driver Features */}
            <div className="bg-white rounded-xl shadow-md p-8">
              <div className="mb-6 p-4 bus-gradient-bg rounded-full inline-flex">
                <BusFront className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Driver Features</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <div className="mr-2 mt-1 text-primary">•</div>
                  <span>Daily student count submission</span>
                </li>
                <li className="flex items-start">
                  <div className="mr-2 mt-1 text-primary">•</div>
                  <span>Personal profile management</span>
                </li>
                <li className="flex items-start">
                  <div className="mr-2 mt-1 text-primary">•</div>
                  <span>Password customization</span>
                </li>
                <li className="flex items-start">
                  <div className="mr-2 mt-1 text-primary">•</div>
                  <span>Assigned bus details view</span>
                </li>
                <li className="flex items-start">
                  <div className="mr-2 mt-1 text-primary">•</div>
                  <span>Dark/light theme preference</span>
                </li>
                <li className="flex items-start">
                  <div className="mr-2 mt-1 text-primary">•</div>
                  <span>Notification preferences</span>
                </li>
                <li className="flex items-start">
                  <div className="mr-2 mt-1 text-primary">•</div>
                  <span>Simple, focused interface</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="bus-gradient-bg py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Log in to your account to access these powerful features and streamline your campus transportation management.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => window.location.href = '/login'}
              variant="secondary"
              size="lg"
              className="bg-white text-primary hover:bg-gray-100"
            >
              <LogIn className="mr-2 h-4 w-4" /> Log In Now
            </Button>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Features;

// Import missing Lucide-React icons
import { LogIn, Button } from 'lucide-react';
