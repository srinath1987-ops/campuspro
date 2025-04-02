
import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-bus-dark text-white py-12 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold text-xl mb-4">Campus Bus Beacon</h3>
            <p className="text-gray-300 mb-4">
              Smart bus tracking and management system for modern campuses.
            </p>
            <div className="flex gap-4">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" 
                className="text-white hover:text-bus-secondary transition-colors">
                <Github size={20} />
              </a>
              <a href="mailto:info@campusbusbeacon.com" 
                className="text-white hover:text-bus-secondary transition-colors">
                <Mail size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-bus-secondary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-bus-secondary transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link to="/bus-points" className="text-gray-300 hover:text-bus-secondary transition-colors">
                  Bus Points
                </Link>
              </li>
              <li>
                <Link to="/features" className="text-gray-300 hover:text-bus-secondary transition-colors">
                  Features
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4">Contact Us</h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-gray-300">
                <Phone size={16} />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center gap-2 text-gray-300">
                <Mail size={16} />
                <span>info@campusbusbeacon.com</span>
              </li>
              <li className="flex items-start gap-2 text-gray-300">
                <MapPin size={16} className="mt-1" />
                <span>University Campus, Transport Division<br />Innovation Street, Tech City</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400">
          <p>&copy; {currentYear} Campus Bus Beacon. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
