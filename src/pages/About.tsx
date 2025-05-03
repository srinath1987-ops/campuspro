import React from 'react';
import { Users, Code, School, Cpu, Server, Award } from 'lucide-react';
import Footer from '@/components/Footer';
import { ResizableNavbar } from '@/components/ResizableNavbar';

// Team Member Card Component
const TeamMemberCard = ({
  name,
  role,
  imageUrl
}: {
  name: string;
  role: string;
  imageUrl: string;
}) => (
  <div className="flex flex-col items-center text-center">
    <div className="w-32 h-32 rounded-full overflow-hidden mb-4 border-4 border-primary/20">
      <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
    </div>
    <h3 className="text-xl font-bold text-foreground">{name}</h3>
    <p className="text-muted-foreground">{role}</p>
  </div>
);

// Technology Card Component
const TechnologyCard = ({
  icon: Icon,
  title,
  description
}: {
  icon: React.ComponentType<any>;
  title: string;
  description: string;
}) => (
  <div className="bg-card dark:bg-card rounded-xl shadow-md p-6 flex flex-col items-center text-center transition-all hover:shadow-lg hover:-translate-y-1 border border-border">
    <div className="mb-4 p-3 bus-gradient-bg rounded-full">
      <Icon className="h-6 w-6 text-white" />
    </div>
    <h3 className="text-lg font-bold mb-2 text-foreground">{title}</h3>
    <p className="text-muted-foreground text-sm">{description}</p>
  </div>
);

const About = () => {
  return (
    <div className="flex flex-col min-h-screen pt-20">
      <ResizableNavbar />

      {/* Hero Section */}
      <section className="bus-hero-pattern py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 bus-gradient-text">
              About CampusPro
            </h1>
            <p className="text-xl text-muted-foreground mb-6">
              Learn about our mission to revolutionize campus transportation management with IoT technology
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-background dark:bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 text-foreground">Our Mission</h2>
              <div className="w-20 h-1 bus-gradient-bg mx-auto rounded-full mb-6"></div>
            </div>

            <div className="text-lg text-muted-foreground space-y-6">
              <p>
                At CampusPro, our mission is to transform campus transportation management through innovative IoT technology. We believe that efficient, transparent, and data-driven bus operations can significantly improve the campus experience for students, staff, and administrators.
              </p>
              <p>
                Our system was born out of the need to address common challenges in campus transportation: tracking bus locations, managing fleet operations, and collecting accurate ridership data. By integrating RFID technology with cloud-based infrastructure, we've created a comprehensive solution that provides real-time insights and streamlines daily operations.
              </p>
              <p>
                We are committed to continuous improvement and innovation, always seeking new ways to enhance our platform and provide greater value to educational institutions. Our team combines expertise in IoT development, database management, and user experience design to deliver a solution that is both powerful and user-friendly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Stack Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-foreground">Our Technology Stack</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We leverage cutting-edge technologies to deliver a robust and scalable solution
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <TechnologyCard
              icon={Cpu}
              title="ESP32 & RFID"
              description="IoT devices with RFID readers to automatically detect bus entry and exit at campus gates."
            />
            <TechnologyCard
              icon={Server}
              title="Supabase Backend"
              description="Secure, scalable database and authentication system for storing and managing all bus data."
            />
            <TechnologyCard
              icon={Code}
              title="React & TypeScript"
              description="Modern frontend framework for building responsive, interactive user interfaces with type safety."
            />
            <TechnologyCard
              icon={School}
              title="Custom Analytics"
              description="Built-in analytics tools for visualizing student counts, bus utilization, and other key metrics."
            />
            <TechnologyCard
              icon={Users}
              title="Role-Based Access"
              description="Tailored user experiences with separate admin and driver portals with appropriate privileges."
            />
            <TechnologyCard
              icon={Award}
              title="Shadcn UI Components"
              description="Beautiful, accessible UI components for a modern and intuitive user experience."
            />
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-background dark:bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-foreground">Our Team</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Meet the talented individuals behind CampusPro
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-10 max-w-4xl mx-auto">
            <TeamMemberCard
              name="V Sree Aditya"
              role="Backend and IoT Developer"
              imageUrl="https://iili.io/37TqMrX.jpg"
            />
            <TeamMemberCard
              name="Venkataraman TSK"
              role="Frontend Developer"
              imageUrl="https://iili.io/37Td3gf.jpg"
            />
            <TeamMemberCard
              name="Shrihari"
              role="Hardware Developer"
              imageUrl="https://iili.io/37TJqoF.jpg"
            />
          </div>
        </div>
      </section>

      {/* Institution Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6 text-foreground">Developed at</h2>
            <div className="bg-card dark:bg-card rounded-xl shadow-md p-8 inline-block border border-border">
              <h3 className="text-2xl font-bold mb-2 text-foreground">Shiv Nadar University Chennai</h3>
              <p className="text-muted-foreground">
              A leading institution committed to advancing innovation and excellence in engineering education.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
