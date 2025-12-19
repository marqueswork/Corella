import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, Calendar, Package, DollarSign, ShoppingCart, Check } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { solutions } from '../data/mock';

const iconMap = {
  Calendar: Calendar,
  Package: Package,
  DollarSign: DollarSign,
  ShoppingCart: ShoppingCart,
};

const Solutions = () => {
  const location = useLocation();

  useEffect(() => {
    // Scroll to section if hash is present
    if (location.hash) {
      const element = document.getElementById(location.hash.slice(1));
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }
  }, [location.hash]);

  return (
    <div>
      {/* Hero */}
      <section className="hero-gradient pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-primary-brand mb-6">
            Solutions built for small businesses
          </h1>
          <p className="text-lg md:text-xl text-secondary-brand max-w-2xl mx-auto">
            Each Corella solution is designed to solve real business problems with simplicity and affordability in mind.
          </p>
        </div>
      </section>

      {/* Solutions List */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto space-y-24">
          {solutions.map((solution, index) => {
            const IconComponent = iconMap[solution.icon];
            const isEven = index % 2 === 0;
            
            return (
              <div
                key={solution.id}
                id={solution.slug}
                className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-12 items-center scroll-mt-32`}
              >
                {/* Content */}
                <div className="flex-1">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#8FEC78] to-[#81DD67] flex items-center justify-center mb-6">
                    {IconComponent && <IconComponent size={32} className="text-white" />}
                  </div>
                  
                  <h2 className="text-3xl md:text-4xl font-bold text-primary-brand mb-4">
                    {solution.name}
                  </h2>
                  
                  <p className="text-lg text-secondary-brand mb-6">
                    {solution.description}
                  </p>
                  
                  <ul className="space-y-3 mb-8">
                    {solution.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-accent-wash flex items-center justify-center flex-shrink-0">
                          <Check size={12} className="text-accent" />
                        </div>
                        <span className="text-body-brand">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Link to="/pricing" className="btn-primary inline-flex">
                    Start Free Trial
                    <ArrowRight className="ml-2" size={20} />
                  </Link>
                </div>
                
                {/* Visual Card */}
                <div className="flex-1 w-full">
                  <Card className="bg-[#fafafa] border border-black/5 overflow-hidden">
                    <CardContent className="p-8">
                      <div className="aspect-video bg-white rounded-xl border border-black/5 flex items-center justify-center">
                        <div className="text-center">
                          {IconComponent && <IconComponent size={64} className="text-[#8FEC78] mx-auto mb-4" />}
                          <p className="text-secondary-brand font-medium">{solution.name}</p>
                          <p className="text-sm text-muted-brand">Product Preview</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-[#fafafa]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-brand mb-4">
            Not sure which solution is right for you?
          </h2>
          <p className="text-secondary-brand text-lg mb-8">
            Our team is here to help you find the perfect fit for your business.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact" className="btn-primary">
              Talk to Sales
            </Link>
            <Link to="/pricing" className="btn-secondary">
              View Pricing
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Solutions;
