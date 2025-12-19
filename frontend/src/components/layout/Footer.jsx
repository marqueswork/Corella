import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone } from 'lucide-react';
import { companyInfo, solutions } from '../../data/mock';

const Footer = () => {
  return (
    <footer className="bg-[#fafafa] border-t border-black/5">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#8FEC78] to-[#81DD67] flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <span className="font-semibold text-lg text-primary-brand">Corella</span>
            </Link>
            <p className="text-secondary-brand text-sm leading-relaxed">
              Simple SaaS solutions designed for small businesses. Focus on what matters while we handle the rest.
            </p>
          </div>

          {/* Solutions */}
          <div>
            <h4 className="font-semibold text-primary-brand mb-4">Solutions</h4>
            <ul className="space-y-3">
              {solutions.map((solution) => (
                <li key={solution.id}>
                  <Link
                    to={`/solutions#${solution.slug}`}
                    className="text-secondary-brand hover:text-primary-brand text-sm transition-colors"
                  >
                    {solution.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-primary-brand mb-4">Company</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/about" className="text-secondary-brand hover:text-primary-brand text-sm transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-secondary-brand hover:text-primary-brand text-sm transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-secondary-brand hover:text-primary-brand text-sm transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-primary-brand mb-4">Get in Touch</h4>
            <ul className="space-y-3">
              <li>
                <a
                  href={`mailto:${companyInfo.email}`}
                  className="flex items-center gap-2 text-secondary-brand hover:text-primary-brand text-sm transition-colors"
                >
                  <Mail size={16} />
                  {companyInfo.email}
                </a>
              </li>
              <li>
                <a
                  href={`https://wa.me/${companyInfo.whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-secondary-brand hover:text-primary-brand text-sm transition-colors"
                >
                  <Phone size={16} />
                  {companyInfo.whatsapp}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-black/5">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-muted-brand text-sm">
              © {new Date().getFullYear()} Corella. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link to="/privacy" className="text-muted-brand hover:text-secondary-brand text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-muted-brand hover:text-secondary-brand text-sm transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
