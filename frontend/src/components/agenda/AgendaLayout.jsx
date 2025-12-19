import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Briefcase,
  Settings,
  Menu,
  X,
  LogOut,
  ChevronDown
} from 'lucide-react';

const AgendaLayout = ({ children, business }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const businessId = business?.business_id;

  const navigation = [
    { name: 'Dashboard', href: '/app/agenda', icon: LayoutDashboard },
    { name: 'Calendar', href: `/app/agenda/calendar`, icon: Calendar },
    { name: 'Clients', href: `/app/agenda/clients`, icon: Users },
    { name: 'Services', href: `/app/agenda/services`, icon: Briefcase },
    { name: 'Settings', href: `/app/agenda/settings`, icon: Settings },
  ];

  const isActive = (href) => {
    if (href === '/app/agenda') {
      return location.pathname === '/app/agenda';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-black/5 transform transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-4 border-b border-black/5">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#8FEC78] to-[#81DD67] flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <span className="font-semibold text-primary-brand">Corella Agenda</span>
            </Link>
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-black/5"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={20} />
            </button>
          </div>

          {/* Business selector */}
          {business && (
            <div className="p-4 border-b border-black/5">
              <div className="text-xs text-muted-brand uppercase tracking-wider mb-1">Business</div>
              <div className="font-medium text-primary-brand truncate">{business.name}</div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                    active
                      ? 'bg-accent-wash text-accent font-medium'
                      : 'text-secondary-brand hover:bg-black/5 hover:text-primary-brand'
                  }`}
                >
                  <Icon size={20} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Public booking link */}
          {business && (
            <div className="p-4 border-t border-black/5">
              <Link
                to={`/agenda/${business.slug}`}
                target="_blank"
                className="block text-sm text-center py-2 px-3 rounded-xl bg-accent-wash text-accent hover:bg-[#8FEC78]/20 transition-colors"
              >
                View Public Booking Page
              </Link>
            </div>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-black/5">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-black/5"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>

            <div className="flex-1" />

            {/* User menu */}
            <div className="relative">
              <button
                className="flex items-center gap-2 p-2 rounded-xl hover:bg-black/5"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#8FEC78] to-[#81DD67] flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </span>
                </div>
                <span className="hidden sm:block text-sm font-medium text-primary-brand">
                  {user?.name || 'User'}
                </span>
                <ChevronDown size={16} className="text-muted-brand" />
              </button>

              {userMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl border border-black/10 shadow-lg z-50">
                    <div className="p-3 border-b border-black/5">
                      <div className="font-medium text-primary-brand truncate">{user?.name}</div>
                      <div className="text-sm text-muted-brand truncate">{user?.email}</div>
                    </div>
                    <div className="p-2">
                      <button
                        onClick={logout}
                        className="flex items-center gap-2 w-full px-3 py-2 text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <LogOut size={18} />
                        Sign out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AgendaLayout;
