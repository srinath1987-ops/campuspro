import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BusFront, Cpu, Smartphone, Shield, Clock, Users } from 'lucide-react';
import { Button } from "@/components/ui/button";
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
  <div className="bus-card p-6 flex flex-col items-center text-center bg-card dark:bg-card border border-border">
    <div className="mb-4 p-3 bus-gradient-bg rounded-full">
      <Icon className="h-6 w-6 text-white" />
    </div>
    <h3 className="text-xl font-bold mb-2 text-foreground">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </div>
);

// Stat Card Component
const StatCard = ({ 
  value, 
  label 
}: { 
  value: string; 
  label: string;
}) => (
  <div className="bg-card dark:bg-card border border-border rounded-lg shadow-md p-6 text-center">
    <div className="text-3xl font-bold bus-gradient-text mb-2">{value}</div>
    <div className="text-muted-foreground">{label}</div>
  </div>
);

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bus-hero-pattern py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bus-gradient-text">
              Smart Bus Tracking for a Smarter Campus
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Real-time monitoring of campus buses with IoT technology, making transportation management efficient and reliable.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                className="bus-gradient-bg hover:opacity-90 text-white font-medium"
                onClick={() => navigate('/features')}
                size="lg"
              >
                Explore Features
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/login')}
                size="lg"
              >
                Login to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-foreground">Key Features</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our IoT-enabled system provides comprehensive solutions for campus bus management
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={BusFront} 
              title="Real-Time Bus Tracking" 
              description="Monitor buses inside and outside campus with precise location tracking using RFID technology."
            />
            <FeatureCard 
              icon={Cpu} 
              title="IoT Integration" 
              description="ESP32 and RFID readers work together to automate gate access and update status in real-time."
            />
            <FeatureCard 
              icon={Smartphone} 
              title="User-Friendly Interface" 
              description="Intuitive dashboards for administrators and drivers with role-based access."
            />
            <FeatureCard 
              icon={Shield} 
              title="Secure Authentication" 
              description="Role-based access control ensures only authorized personnel can access specific features."
            />
            <FeatureCard 
              icon={Clock} 
              title="Timestamp Logging" 
              description="Automatic recording of entry and exit times for comprehensive reporting and analysis."
            />
            <FeatureCard 
              icon={Users} 
              title="Student Count Management" 
              description="Easy-to-use interface for drivers to update daily student counts for each route."
            />
          </div>
        </div>
      </section>
      
      {/* Stats Section */}
      <section className="py-16 bg-background dark:bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-foreground">System at a Glance</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our smart bus tracking system is designed to scale with your campus needs
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <StatCard value="100%" label="Automated" />
            <StatCard value="24/7" label="Monitoring" />
            <StatCard value="5s" label="Response Time" />
            <StatCard value="99.9%" label="Uptime" />
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="bus-gradient-bg py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Campus Transportation?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Get started with our smart bus tracking system today and experience efficient, reliable campus transportation management.
          </p>
          <Button 
            variant="secondary" 
            size="lg"
            className="bg-white text-bus-primary hover:bg-gray-100"
            onClick={() => navigate('/login')}
          >
            Get Started Now
          </Button>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Index;
