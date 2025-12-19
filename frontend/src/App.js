import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

// Institutional pages
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Solutions from './pages/Solutions';
import Pricing from './pages/Pricing';
import About from './pages/About';
import Contact from './pages/Contact';

// Agenda SaaS
import AgendaApp from './pages/agenda/AgendaApp';
import PublicBooking from './pages/agenda/PublicBooking';

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Institutional Website */}
            <Route path="/" element={<Layout><Home /></Layout>} />
            <Route path="/solutions" element={<Layout><Solutions /></Layout>} />
            <Route path="/pricing" element={<Layout><Pricing /></Layout>} />
            <Route path="/about" element={<Layout><About /></Layout>} />
            <Route path="/contact" element={<Layout><Contact /></Layout>} />
            
            {/* Corella Agenda SaaS App */}
            <Route path="/app/agenda/*" element={<AgendaApp />} />
            
            {/* Public Booking Page (no auth required) */}
            <Route path="/agenda/:slug" element={<PublicBooking />} />
            
            {/* Future routes for other SaaS apps */}
            <Route path="/app/inventory/*" element={<Layout><Home /></Layout>} />
            <Route path="/app/finance/*" element={<Layout><Home /></Layout>} />
            <Route path="/app/orders/*" element={<Layout><Home /></Layout>} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
}

export default App;
