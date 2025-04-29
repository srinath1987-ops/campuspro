
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BusFront, Cpu, Smartphone, Shield, Clock, Users, ArrowRight, Check } from 'lucide-react';
import { Button } from "@/components/ui/button";
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ChatAssistant from '@/components/ChatAssistant';

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
  <div className="p-6 flex flex-col items-center text-center bg-gray-900 border border-gray-800 rounded-lg hover:border-yellow-500/30 transition-all duration-300">
    <div className="mb-4 p-3 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full">
      <Icon className="h-6 w-6 text-black" />
    </div>
    <h3 className="text-xl font-bold mb-2 text-white">{title}</h3>
    <p className="text-gray-400">{description}</p>
  </div>
);

// Compatibility Item Component
const CompatibilityItem = ({ 
  title,
  status = "ready"
}: { 
  title: string;
  status?: "ready" | "conditional" | "undetectable";
}) => {
  const getStatusBadge = () => {
    switch(status) {
      case "conditional":
        return (
          <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded bg-yellow-400/20 text-yellow-400">
            Conditional
          </span>
        );
      case "undetectable":
        return (
          <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded bg-green-500/20 text-green-500">
            Undetectable
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="border-b border-gray-800 py-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <span className="text-gray-500 text-sm">00{Math.floor(Math.random() * 9) + 1}</span>
        <span className="text-white font-medium">{title}</span>
      </div>
      <div className="flex items-center gap-2">
        {getStatusBadge()}
        <button className="text-gray-400 hover:text-white">
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

// Pricing Card Component
const PricingCard = ({
  title,
  subtitle,
  price,
  period,
  features,
  buttonText,
  isPopular,
}: {
  title: string;
  subtitle?: string;
  price: string;
  period: string;
  features: string[];
  buttonText: string;
  isPopular?: boolean;
}) => (
  <div className={`bg-gray-900 border ${isPopular ? 'border-yellow-500/50' : 'border-gray-800'} rounded-lg overflow-hidden ${isPopular ? 'relative' : ''}`}>
    {isPopular && (
      <div className="absolute top-3 right-3">
        <div className="bg-yellow-400 rounded-full p-2">
          <Check className="h-4 w-4 text-black" />
        </div>
      </div>
    )}
    <div className="p-6">
      <h3 className="text-xl font-bold text-white">{title}</h3>
      {subtitle && <p className="text-gray-400 text-sm mt-1">{subtitle}</p>}
      <div className="mt-4 mb-6">
        <span className="text-4xl font-bold text-white">{price}</span>
        <span className="text-gray-400 ml-1">/ {period}</span>
      </div>
      <ul className="space-y-3 mb-6">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center text-gray-300">
            <Check className="h-4 w-4 text-yellow-400 mr-2" /> {feature}
          </li>
        ))}
      </ul>
      <Button
        className={`w-full ${isPopular ? 'bg-yellow-400 hover:bg-yellow-500 text-black' : 'bg-gray-800 hover:bg-gray-700 text-white'}`}
      >
        {buttonText}
      </Button>
    </div>
  </div>
);

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="py-20 md:py-28 border-b border-gray-800">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white">
              Campus <span className="text-yellow-400">Bus Tracking</span> Made Simple
            </h1>
            <p className="text-xl text-gray-400 mb-8">
              Real-time monitoring of campus buses with IoT technology, making transportation management efficient and reliable.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                className="bg-yellow-400 hover:bg-yellow-500 text-black font-medium"
                onClick={() => navigate('/features')}
                size="lg"
              >
                Explore Features
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/login')}
                size="lg"
                className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
              >
                Login to Dashboard
              </Button>
            </div>
            <div className="mt-10 p-4 bg-gray-900 border border-gray-800 rounded-lg inline-block">
              <p className="text-sm text-gray-400">
                This still works. <span className="text-yellow-400 underline cursor-pointer">Here's how we know.</span> →
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Main Headline Section */}
      <section className="py-20 border-b border-gray-800">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-5xl md:text-6xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-yellow-400">
            IoT for Campus Transportation
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-12">
            Campus Pro is the ultimate IoT solution for monitoring and managing campus bus transportation systems.
          </p>
          
          {/* Sample screenshot or mockup could go here */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
            <div className="p-6 bg-gray-900 border border-gray-800 rounded-lg text-left">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-yellow-400 rounded-full mr-3">
                  <span className="text-black font-bold">You</span>
                </div>
                <span className="text-gray-400">screen-sharing on Zoom</span>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 h-48">
                {/* Demo content */}
                <p className="text-gray-300">Campus bus tracking interface</p>
              </div>
            </div>
            <div className="p-6 bg-gray-900 border border-gray-800 rounded-lg text-left">
              <div className="flex items-center mb-4">
                <span className="text-yellow-400 font-bold mr-2">Admin</span>
                <span className="text-gray-400">watching the dashboard</span>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 h-48">
                {/* Demo content */}
                <p className="text-gray-300">Real-time bus status updates</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 border-b border-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-white">Key Features</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
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
      
      {/* Compatibility Section */}
      <section className="py-20 border-b border-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-white">Does it still work?</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Until institutions switch to a different system, Campus Pro will continue to work seamlessly with your existing infrastructure.
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <div className="mb-6 p-4 bg-yellow-400/10 border border-yellow-500/30 rounded-lg">
              <p className="text-sm text-yellow-300 flex items-start">
                <span className="bg-yellow-400 text-black p-1 rounded mr-2 mt-0.5">!</span>
                <span>Important: Please make sure your RFID readers are properly configured for optimal performance.</span>
              </p>
            </div>
            
            <CompatibilityItem title="RFID Gate System" />
            <CompatibilityItem title="Campus Network" status="conditional" />
            <CompatibilityItem title="Mobile Applications" status="undetectable" />
            <CompatibilityItem title="Administrator Dashboard" status="undetectable" />
          </div>
        </div>
      </section>
      
      {/* Pricing Section */}
      <section className="py-20 border-b border-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-white">Pricing</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Simple and transparent pricing for every campus size.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <PricingCard
              title="Basic"
              subtitle="Try it and see"
              price="$0"
              period="month"
              features={[
                "Up to 5 buses",
                "Basic tracking",
                "Standard reports",
                "Email support"
              ]}
              buttonText="Get Started"
            />
            <PricingCard
              title="Standard"
              subtitle="Most popular"
              price="$99"
              period="month"
              features={[
                "Up to 20 buses",
                "Advanced tracking",
                "Detailed analytics",
                "Priority support"
              ]}
              buttonText="Subscribe"
              isPopular={true}
            />
            <PricingCard
              title="Enterprise"
              subtitle="For large campuses"
              price="$199"
              period="month"
              features={[
                "Unlimited buses",
                "Complete feature set",
                "Custom integrations",
                "24/7 support"
              ]}
              buttonText="Contact Sales"
            />
          </div>
        </div>
      </section>
      
      {/* FAQ Section */}
      <section className="py-20 border-b border-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-white">Common Questions</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Everything you need to know about Campus Pro bus tracking.
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto">
            {['Is the system difficult to install?', 
              'How many buses can I track simultaneously?', 
              'Do I need special hardware?',
              'Is training provided for administrators?',
              'How secure is the system?',
              'Can I integrate with existing systems?'
            ].map((question, index) => (
              <div key={index} className="border-b border-gray-800 py-5">
                <button className="w-full flex items-center justify-between text-left text-lg font-medium text-white hover:text-yellow-400">
                  {question}
                  <ArrowRight className="h-5 w-5 transform rotate-90" />
                </button>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <p className="text-gray-400">Have more questions? <span className="text-yellow-400 underline cursor-pointer">Visit our help center</span> for detailed guides and support.</p>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-yellow-400 to-yellow-500">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6 text-black">Ready to Transform Your Campus Transportation?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-black/80">
            Get started with our smart bus tracking system today and experience efficient, reliable campus transportation management.
          </p>
          <Button 
            variant="secondary" 
            size="lg"
            className="bg-black text-white hover:bg-gray-900"
            onClick={() => navigate('/login')}
          >
            Get Started Now
          </Button>
        </div>
      </section>
      
      <Footer />
      <ChatAssistant />
    </div>
  );
};

export default Index;
