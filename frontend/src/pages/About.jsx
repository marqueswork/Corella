import React from 'react';
import { Link } from 'react-router-dom';
import { Target, Eye, Heart, Users, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { companyInfo } from '../data/mock';

const About = () => {
  return (
    <div>
      {/* Hero */}
      <section className="hero-gradient pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-primary-brand mb-6">
            About Corella
          </h1>
          <p className="text-lg md:text-xl text-secondary-brand max-w-2xl mx-auto">
            We believe every small business deserves access to powerful, simple tools that make daily operations effortless.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-brand mb-6">
              Our Story
            </h2>
            <div className="space-y-4 text-body-brand text-lg leading-relaxed">
              <p>
                Corella was born from a simple observation: small business owners spend too much time wrestling with complicated software instead of focusing on what they do best — serving their customers.
              </p>
              <p>
                We set out to build a suite of tools that are powerful enough to handle real business needs, yet simple enough that anyone can use them without training or IT support.
              </p>
              <p>
                Today, Corella helps thousands of small businesses across the globe manage their schedules, inventory, finances, and orders with ease.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 px-6 bg-[#fafafa]">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="card-hover border border-black/5 bg-white">
              <CardContent className="p-8">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#8FEC78] to-[#81DD67] flex items-center justify-center mb-6">
                  <Target size={28} className="text-white" />
                </div>
                <h3 className="text-2xl font-bold text-primary-brand mb-4">Our Mission</h3>
                <p className="text-secondary-brand text-lg leading-relaxed">
                  {companyInfo.mission}
                </p>
              </CardContent>
            </Card>
            
            <Card className="card-hover border border-black/5 bg-white">
              <CardContent className="p-8">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#8FEC78] to-[#81DD67] flex items-center justify-center mb-6">
                  <Eye size={28} className="text-white" />
                </div>
                <h3 className="text-2xl font-bold text-primary-brand mb-4">Our Vision</h3>
                <p className="text-secondary-brand text-lg leading-relaxed">
                  {companyInfo.vision}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-brand mb-4">
              What we stand for
            </h2>
            <p className="text-secondary-brand text-lg">
              These values guide everything we do at Corella.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-accent-wash flex items-center justify-center mx-auto mb-6">
                <Heart size={32} className="text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-primary-brand mb-3">Simplicity First</h3>
              <p className="text-secondary-brand">
                We believe the best software is invisible. It just works, without getting in your way.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-accent-wash flex items-center justify-center mx-auto mb-6">
                <Users size={32} className="text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-primary-brand mb-3">Customer Obsessed</h3>
              <p className="text-secondary-brand">
                Every feature we build starts with a real problem faced by real small business owners.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-accent-wash flex items-center justify-center mx-auto mb-6">
                <Target size={32} className="text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-primary-brand mb-3">Fair & Transparent</h3>
              <p className="text-secondary-brand">
                No hidden fees, no confusing pricing. What you see is what you get, always.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 hero-gradient">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-brand mb-4">
            Ready to simplify your business?
          </h2>
          <p className="text-secondary-brand text-lg mb-8">
            Join thousands of small business owners who trust Corella.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/pricing" className="btn-primary">
              Start Free Trial
              <ArrowRight className="ml-2" size={20} />
            </Link>
            <Link to="/contact" className="btn-secondary">
              Get in Touch
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
