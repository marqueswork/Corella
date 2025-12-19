import React from 'react';
import { Link } from 'react-router-dom';
import { Check, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { pricingPlans } from '../data/mock';

const Pricing = () => {
  return (
    <div>
      {/* Hero */}
      <section className="hero-gradient pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-primary-brand mb-6">
            Simple, transparent pricing
          </h1>
          <p className="text-lg md:text-xl text-secondary-brand max-w-2xl mx-auto">
            Choose the plan that fits your business. No hidden fees, no long-term contracts. Cancel anytime.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {pricingPlans.map((plan) => (
              <Card 
                key={plan.id} 
                className={`card-hover relative overflow-hidden ${
                  plan.highlighted 
                    ? 'border-2 border-[#8FEC78] shadow-lg' 
                    : 'border border-black/10'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-[#8FEC78] to-[#81DD67] text-white text-sm font-medium py-2 text-center">
                    Most Popular
                  </div>
                )}
                <CardHeader className={plan.highlighted ? 'pt-12' : ''}>
                  <CardTitle className="text-xl text-primary-brand">{plan.name}</CardTitle>
                  <CardDescription className="text-secondary-brand">
                    {plan.description}
                  </CardDescription>
                  <div className="pt-4">
                    <span className="text-4xl font-bold text-primary-brand">${plan.price}</span>
                    <span className="text-secondary-brand">/month</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-accent-wash flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check size={12} className="text-accent" />
                        </div>
                        <span className="text-body-brand text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <button 
                    className={`w-full ${plan.highlighted ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    Get Started
                    <ArrowRight className="ml-2" size={18} />
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ / Additional Info */}
      <section className="py-20 px-6 bg-[#fafafa]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-primary-brand text-center mb-12">
            Frequently asked questions
          </h2>
          
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 border border-black/5">
              <h3 className="font-semibold text-primary-brand mb-2">Can I change plans later?</h3>
              <p className="text-secondary-brand">Yes! You can upgrade or downgrade your plan at any time. Changes take effect on your next billing cycle.</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 border border-black/5">
              <h3 className="font-semibold text-primary-brand mb-2">Is there a free trial?</h3>
              <p className="text-secondary-brand">Absolutely. All plans come with a 14-day free trial. No credit card required to start.</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 border border-black/5">
              <h3 className="font-semibold text-primary-brand mb-2">What payment methods do you accept?</h3>
              <p className="text-secondary-brand">We accept all major credit cards, debit cards, and PayPal. All payments are processed securely.</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 border border-black/5">
              <h3 className="font-semibold text-primary-brand mb-2">Can I cancel anytime?</h3>
              <p className="text-secondary-brand">Yes, you can cancel your subscription at any time. There are no cancellation fees or long-term commitments.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-brand mb-4">
            Need a custom plan?
          </h2>
          <p className="text-secondary-brand text-lg mb-8">
            Contact our sales team for custom pricing and enterprise solutions.
          </p>
          <Link to="/contact" className="btn-primary">
            Talk to Sales
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Pricing;
