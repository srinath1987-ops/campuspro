
import React from 'react';
import { BusFront, Cpu, Radio, Clock, Shield, Users } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// Technology Card Component
const TechCard = ({ 
  icon: Icon, 
  title, 
  description 
}: { 
  icon: React.ComponentType<any>; 
  title: string; 
  description: string;
}) => (
  <div className="bg-white rounded-xl shadow-md p-6 border border-border hover:shadow-lg transition-all duration-300">
    <div className="mb-4 p-3 bus-gradient-bg rounded-full inline-block">
      <Icon className="h-6 w-6 text-white" />
    </div>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

const About = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-bus-primary to-bus-secondary text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">About Campus Bus Beacon</h1>
          <p className="text-xl max-w-3xl mx-auto">
            An innovative IoT-enabled solution for smart campus bus tracking and management
          </p>
        </div>
      </section>
      
      {/* Project Description */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-center">Our Mission</h2>
            <p className="text-lg text-gray-700 mb-6">
              Campus Bus Beacon is designed to revolutionize how educational institutions manage their transportation systems. By leveraging IoT technologies like RFID and ESP32 microcontrollers, we provide real-time tracking of campus buses, automated entry/exit recording, and comprehensive management tools.
            </p>
            <p className="text-lg text-gray-700 mb-6">
              Our system helps transportation administrators make data-driven decisions, optimize bus routes, and ensure efficient operations. For drivers, we provide a simple interface to report student counts and access their route information.
            </p>
            <p className="text-lg text-gray-700">
              Built with security and scalability in mind, Campus Bus Beacon is the perfect solution for modern campuses looking to enhance their transportation infrastructure.
            </p>
          </div>
        </div>
      </section>
      
      {/* Technology Stack */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">Technology Stack</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <TechCard 
              icon={Cpu} 
              title="ESP32 Microcontroller" 
              description="Wi-Fi enabled microcontroller that processes RFID data, controls servo motors, and communicates with the backend server."
            />
            <TechCard 
              icon={Radio} 
              title="RFID Technology" 
              description="RFID tags and readers enable contactless identification of buses at entry and exit points, automating status updates."
            />
            <TechCard 
              icon={BusFront} 
              title="Real-time Tracking" 
              description="Instant updates on bus status (inside/outside campus) with timestamp logging for comprehensive reporting."
            />
            <TechCard 
              icon={Clock} 
              title="Time-Based Analytics" 
              description="Historical data collection for entry/exit times and student counts to identify patterns and optimize operations."
            />
            <TechCard 
              icon={Shield} 
              title="Secure Authentication" 
              description="Role-based access control ensures that only authorized personnel can access sensitive features and data."
            />
            <TechCard 
              icon={Users} 
              title="User-Friendly Dashboards" 
              description="Intuitive interfaces for administrators and drivers with dedicated features for their specific needs."
            />
          </div>
        </div>
      </section>
      
      {/* Team Section (Mock) */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">Our Team</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { name: "Alex Johnson", role: "Project Lead", imgNum: 1 },
              { name: "Sarah Chen", role: "IoT Specialist", imgNum: 2 },
              { name: "Michael Rodriguez", role: "Frontend Developer", imgNum: 3 },
              { name: "Priya Patel", role: "Backend Engineer", imgNum: 4 }
            ].map((member, index) => (
              <div key={index} className="text-center">
                <div className="bg-gray-200 rounded-full w-32 h-32 mx-auto mb-4 overflow-hidden">
                  <div className="w-full h-full flex items-center justify-center text-gray-500 text-4xl font-bold">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                </div>
                <h3 className="text-xl font-bold">{member.name}</h3>
                <p className="text-gray-600">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Contact CTA */}
      <section className="py-16 bg-bus-dark text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Interested in Implementing This System?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            We'd love to discuss how Campus Bus Beacon can transform your institution's transportation management.
          </p>
          <button className="px-8 py-3 bg-white text-bus-primary rounded-full font-bold hover:bg-gray-100 transition-colors">
            Contact Us
          </button>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default About;
