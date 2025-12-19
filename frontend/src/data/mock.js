// Mock data for Corella SaaS Website

export const solutions = [
  {
    id: 'agenda',
    name: 'Corella Agenda',
    slug: 'agenda',
    shortDescription: 'Online scheduling made simple for service businesses.',
    description: 'Streamline your appointment booking with an intuitive online scheduling system. Let your customers book anytime, anywhere.',
    features: [
      'Online booking 24/7',
      'Automatic reminders via email',
      'Calendar sync with Google & Outlook',
      'Customer management',
      'Multiple staff scheduling'
    ],
    icon: 'Calendar'
  },
  {
    id: 'inventory',
    name: 'Corella Inventory',
    slug: 'inventory',
    shortDescription: 'Simple stock control for small businesses.',
    description: 'Keep track of your products with ease. Know exactly what you have, what you need, and when to reorder.',
    features: [
      'Real-time stock tracking',
      'Low stock alerts',
      'Barcode scanning support',
      'Purchase order management',
      'Inventory reports'
    ],
    icon: 'Package'
  },
  {
    id: 'finance',
    name: 'Corella Finance',
    slug: 'finance',
    shortDescription: 'Cash flow and expense management simplified.',
    description: 'Take control of your business finances. Track income, manage expenses, and understand your cash flow at a glance.',
    features: [
      'Income & expense tracking',
      'Cash flow dashboard',
      'Expense categorization',
      'Financial reports',
      'Bank reconciliation'
    ],
    icon: 'DollarSign'
  },
  {
    id: 'orders',
    name: 'Corella Orders',
    slug: 'orders',
    shortDescription: 'Order management for growing businesses.',
    description: 'Manage customer orders from start to finish. Track status, handle fulfillment, and keep customers informed.',
    features: [
      'Order tracking dashboard',
      'Status updates & notifications',
      'Customer order history',
      'Invoice generation',
      'Delivery management'
    ],
    icon: 'ShoppingCart'
  }
];

export const benefits = [
  {
    id: 1,
    title: 'Simple and Intuitive',
    description: 'No training required. Start using our tools in minutes with a clean, easy-to-understand interface.',
    icon: 'Sparkles'
  },
  {
    id: 2,
    title: 'Affordable Monthly Plans',
    description: 'Fair pricing designed for small businesses. No hidden fees, no long-term contracts.',
    icon: 'Wallet'
  },
  {
    id: 3,
    title: 'Built for Small Businesses',
    description: 'Every feature is designed with small business owners in mind. No enterprise complexity.',
    icon: 'Building2'
  },
  {
    id: 4,
    title: 'No Complex Setup',
    description: 'Get started in minutes. Our solutions work out of the box with minimal configuration.',
    icon: 'Zap'
  }
];

export const howItWorks = [
  {
    step: 1,
    title: 'Create an Account',
    description: 'Sign up for free in under a minute. No credit card required to start.'
  },
  {
    step: 2,
    title: 'Choose Your Solution',
    description: 'Pick the tools that fit your business needs. Start with one or bundle them together.'
  },
  {
    step: 3,
    title: 'Start Managing Your Business',
    description: 'Begin organizing your operations immediately. Our intuitive interface makes it easy.'
  }
];

export const testimonials = [
  {
    id: 1,
    name: 'Maria Santos',
    role: 'Hair Salon Owner',
    content: 'Corella Agenda transformed how I manage appointments. My clients love being able to book online, and I never double-book anymore.',
    avatar: 'M'
  },
  {
    id: 2,
    name: 'Carlos Oliveira',
    role: 'Small Store Owner',
    content: 'Finally, inventory software I can actually understand! Corella Inventory helps me know exactly what I have in stock without any complicated setup.',
    avatar: 'C'
  },
  {
    id: 3,
    name: 'Ana Costa',
    role: 'Freelance Consultant',
    content: 'Corella Finance gives me peace of mind. I can see my cash flow clearly and make better decisions for my business.',
    avatar: 'A'
  }
];

export const pricingPlans = [
  {
    id: 'basic',
    name: 'Basic',
    price: 9,
    description: 'Perfect for getting started',
    features: [
      '1 Solution included',
      'Up to 100 customers',
      'Email support',
      'Basic reports',
      'Mobile app access'
    ],
    highlighted: false
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 19,
    description: 'Best for growing businesses',
    features: [
      '2 Solutions included',
      'Up to 500 customers',
      'Priority email support',
      'Advanced reports',
      'Mobile app access',
      'Data export',
      'Integrations'
    ],
    highlighted: true
  },
  {
    id: 'business',
    name: 'Business',
    price: 29,
    description: 'For established businesses',
    features: [
      'All Solutions included',
      'Unlimited customers',
      'Priority phone support',
      'Custom reports',
      'Mobile app access',
      'Data export',
      'All integrations',
      'Team accounts (up to 5)'
    ],
    highlighted: false
  }
];

export const companyInfo = {
  name: 'Corella',
  tagline: 'Simple SaaS solutions to manage your business with ease.',
  description: 'Corella provides simple, affordable, and easy-to-use SaaS tools designed for micro and small businesses.',
  mission: 'To empower small businesses with simple, powerful tools that make daily operations effortless.',
  vision: 'A world where every small business owner can focus on what they do best, while we handle the rest.',
  email: 'hello@corella.com',
  whatsapp: '+1 (555) 123-4567'
};
