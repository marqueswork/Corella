import React, { useState } from 'react';
import { Mail, Phone, Send, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { companyInfo } from '../data/mock';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length === 0) {
      // Mock submission - stores in localStorage for demo
      const submissions = JSON.parse(localStorage.getItem('corella_contacts') || '[]');
      submissions.push({
        ...formData,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('corella_contacts', JSON.stringify(submissions));
      
      setSubmitted(true);
      setFormData({ name: '', email: '', message: '' });
    } else {
      setErrors(newErrors);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div>
      {/* Hero */}
      <section className="hero-gradient pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-primary-brand mb-6">
            Get in touch
          </h1>
          <p className="text-lg md:text-xl text-secondary-brand max-w-2xl mx-auto">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <Card className="border border-black/5">
              <CardContent className="p-8">
                {submitted ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-accent-wash flex items-center justify-center mx-auto mb-6">
                      <CheckCircle size={32} className="text-accent" />
                    </div>
                    <h3 className="text-2xl font-semibold text-primary-brand mb-3">
                      Message sent!
                    </h3>
                    <p className="text-secondary-brand mb-6">
                      Thank you for reaching out. We'll get back to you within 24 hours.
                    </p>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="btn-secondary"
                    >
                      Send another message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-primary-brand mb-2">
                        Name
                      </label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Your name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`h-12 rounded-xl ${errors.name ? 'border-red-500' : ''}`}
                      />
                      {errors.name && (
                        <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-primary-brand mb-2">
                        Email
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={handleChange}
                        className={`h-12 rounded-xl ${errors.email ? 'border-red-500' : ''}`}
                      />
                      {errors.email && (
                        <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-primary-brand mb-2">
                        Message
                      </label>
                      <Textarea
                        id="message"
                        name="message"
                        placeholder="How can we help you?"
                        value={formData.message}
                        onChange={handleChange}
                        rows={5}
                        className={`rounded-xl resize-none ${errors.message ? 'border-red-500' : ''}`}
                      />
                      {errors.message && (
                        <p className="text-red-500 text-sm mt-1">{errors.message}</p>
                      )}
                    </div>
                    
                    <button type="submit" className="btn-primary w-full">
                      Send Message
                      <Send className="ml-2" size={18} />
                    </button>
                  </form>
                )}
              </CardContent>
            </Card>

            {/* Contact Info */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-primary-brand mb-4">
                  Other ways to reach us
                </h2>
                <p className="text-secondary-brand">
                  Prefer a different way to get in touch? No problem. Choose the option that works best for you.
                </p>
              </div>
              
              <div className="space-y-4">
                <Card className="card-hover border border-black/5">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-accent-wash flex items-center justify-center">
                        <Mail size={24} className="text-accent" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-primary-brand">Email us</h3>
                        <a 
                          href={`mailto:${companyInfo.email}`}
                          className="text-secondary-brand hover:text-accent transition-colors"
                        >
                          {companyInfo.email}
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="card-hover border border-black/5">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-accent-wash flex items-center justify-center">
                        <Phone size={24} className="text-accent" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-primary-brand">WhatsApp</h3>
                        <a 
                          href={`https://wa.me/${companyInfo.whatsapp.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-secondary-brand hover:text-accent transition-colors"
                        >
                          {companyInfo.whatsapp}
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="bg-[#fafafa] rounded-2xl p-8 border border-black/5">
                <h3 className="font-semibold text-primary-brand mb-3">Response time</h3>
                <p className="text-secondary-brand">
                  We typically respond within 24 hours during business days. For urgent matters, WhatsApp is the fastest way to reach us.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
