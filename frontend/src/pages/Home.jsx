import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, Package, DollarSign, ShoppingCart, Sparkles, Wallet, Building2, Zap, Check } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { solutions, benefits, howItWorks, testimonials } from '../data/mock';

const iconMap = {
  Calendar: Calendar,
  Package: Package,
  DollarSign: DollarSign,
  ShoppingCart: ShoppingCart,
  Sparkles: Sparkles,
  Wallet: Wallet,
  Building2: Building2,
  Zap: Zap,
};

const Home = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="hero-gradient min-h-screen flex items-center justify-center pt-24 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-wash border border-[#8FEC78]/30 mb-8">
            <span className="w-2 h-2 rounded-full bg-[#8FEC78]"></span>
            <span className="text-sm font-medium text-accent">Simple tools for small businesses</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-brand leading-tight mb-6">
            Simple SaaS solutions to manage your business with ease.
          </h1>
          
          <p className="text-lg md:text-xl text-secondary-brand max-w-2xl mx-auto mb-10">
            Corella provides affordable, easy-to-use tools designed specifically for micro and small businesses. No complexity, just results.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/pricing" className="btn-primary text-base px-8 py-4">
              Start Free Trial
              <ArrowRight className="ml-2" size={20} />
            </Link>
            <Link to="/solutions" className="btn-secondary text-base px-8 py-4">
              View Solutions
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-brand mb-4">
              Why choose Corella?
            </h2>
            <p className="text-secondary-brand text-lg max-w-2xl mx-auto">
              We built Corella with small business owners in mind. Every feature is designed to save you time and headaches.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit) => {
              const IconComponent = iconMap[benefit.icon];
              return (
                <Card key={benefit.id} className="card-hover border border-black/5 bg-white">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-xl bg-accent-wash flex items-center justify-center mb-4">
                      {IconComponent && <IconComponent size={24} className="text-accent" />}
                    </div>
                    <h3 className="font-semibold text-lg text-primary-brand mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-secondary-brand text-sm leading-relaxed">
                      {benefit.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Solutions Overview */}
      <section className="py-20 px-6 bg-[#fafafa]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-brand mb-4">
              Our Solutions
            </h2>
            <p className="text-secondary-brand text-lg max-w-2xl mx-auto">
              Choose the tools that fit your business. Start with one or bundle them together.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {solutions.map((solution) => {
              const IconComponent = iconMap[solution.icon];
              return (
                <Card key={solution.id} className="card-hover border border-black/5 bg-white overflow-hidden">
                  <CardContent className="p-8">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#8FEC78] to-[#81DD67] flex items-center justify-center flex-shrink-0">
                        {IconComponent && <IconComponent size={28} className="text-white" />}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-xl text-primary-brand mb-2">
                          {solution.name}
                        </h3>
                        <p className="text-secondary-brand mb-4">
                          {solution.shortDescription}
                        </p>
                        <Link 
                          to={`/solutions#${solution.slug}`}
                          className="inline-flex items-center gap-1 text-accent font-medium hover:gap-2 transition-all"
                        >
                          Learn more
                          <ArrowRight size={16} />
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-brand mb-4">
              How it works
            </h2>
            <p className="text-secondary-brand text-lg">
              Getting started with Corella takes just minutes.
            </p>
          </div>
          
          <div className="space-y-8">
            {howItWorks.map((step, index) => (
              <div key={step.step} className="flex items-start gap-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#8FEC78] to-[#81DD67] flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold">{step.step}</span>
                </div>
                <div className="flex-1 pt-2">
                  <h3 className="font-semibold text-xl text-primary-brand mb-2">
                    {step.title}
                  </h3>
                  <p className="text-secondary-brand">
                    {step.description}
                  </p>
                </div>
                {index < howItWorks.length - 1 && (
                  <div className="hidden md:block absolute left-6 top-12 w-0.5 h-8 bg-[#8FEC78]/30"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6 bg-[#fafafa]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-brand mb-4">
              Loved by small businesses
            </h2>
            <p className="text-secondary-brand text-lg">
              See what our customers have to say about Corella.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.id} className="card-hover border border-black/5 bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8FEC78] to-[#81DD67] flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">{testimonial.avatar}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-primary-brand">{testimonial.name}</p>
                      <p className="text-sm text-secondary-brand">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-body-brand leading-relaxed">
                    &ldquo;{testimonial.content}&rdquo;
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 hero-gradient">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-brand mb-4">
            Start organizing your business today with Corella
          </h2>
          <p className="text-secondary-brand text-lg mb-8">
            Join thousands of small business owners who trust Corella to manage their daily operations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/pricing" className="btn-primary text-base px-8 py-4">
              Start Free Trial
              <ArrowRight className="ml-2" size={20} />
            </Link>
            <Link to="/contact" className="btn-secondary text-base px-8 py-4">
              Talk to Sales
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
