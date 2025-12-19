import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AgendaLayout from '../../components/agenda/AgendaLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import {
  Calendar,
  Users,
  Clock,
  TrendingUp,
  Plus,
  ArrowRight
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Dashboard = ({ business }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState([]);
  const [clients, setClients] = useState([]);

  useEffect(() => {
    if (business?.business_id) {
      fetchDashboard();
      fetchServices();
      fetchClients();
    }
  }, [business]);

  const fetchDashboard = async () => {
    try {
      const res = await fetch(`${API}/agenda/businesses/${business.business_id}/dashboard`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const res = await fetch(`${API}/agenda/businesses/${business.business_id}/services`, {
        credentials: 'include'
      });
      if (res.ok) {
        setServices(await res.json());
      }
    } catch (error) {
      console.error('Failed to fetch services:', error);
    }
  };

  const fetchClients = async () => {
    try {
      const res = await fetch(`${API}/agenda/businesses/${business.business_id}/clients`, {
        credentials: 'include'
      });
      if (res.ok) {
        setClients(await res.json());
      }
    } catch (error) {
      console.error('Failed to fetch clients:', error);
    }
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const getServiceName = (serviceId) => {
    const service = services.find(s => s.service_id === serviceId);
    return service?.name || 'Service';
  };

  const getClientName = (clientId) => {
    const client = clients.find(c => c.client_id === clientId);
    return client?.name || 'Client';
  };

  if (loading) {
    return (
      <AgendaLayout business={business}>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-[#8FEC78] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </AgendaLayout>
    );
  }

  return (
    <AgendaLayout business={business}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-primary-brand">Dashboard</h1>
            <p className="text-secondary-brand">Welcome back! Here is what is happening today.</p>
          </div>
          <Link
            to="/app/agenda/calendar"
            className="btn-primary inline-flex items-center gap-2"
          >
            <Plus size={20} />
            New Appointment
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border border-black/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent-wash flex items-center justify-center">
                  <Clock size={20} className="text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary-brand">{stats?.stats?.today || 0}</p>
                  <p className="text-sm text-secondary-brand">Today</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-black/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Calendar size={20} className="text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary-brand">{stats?.stats?.this_week || 0}</p>
                  <p className="text-sm text-secondary-brand">This Week</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-black/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                  <TrendingUp size={20} className="text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary-brand">{stats?.stats?.this_month || 0}</p>
                  <p className="text-sm text-secondary-brand">This Month</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-black/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                  <Users size={20} className="text-orange-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary-brand">{stats?.stats?.total_clients || 0}</p>
                  <p className="text-sm text-secondary-brand">Clients</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Today's and Upcoming */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Today's Appointments */}
          <Card className="border border-black/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-primary-brand">Today&apos;s Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              {stats?.today_appointments?.length > 0 ? (
                <div className="space-y-3">
                  {stats.today_appointments.map((apt) => (
                    <div
                      key={apt.appointment_id}
                      className={`p-3 rounded-xl border ${
                        apt.status === 'canceled'
                          ? 'bg-red-50 border-red-100'
                          : apt.status === 'completed'
                          ? 'bg-green-50 border-green-100'
                          : 'bg-white border-black/5'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-primary-brand">
                            {getClientName(apt.client_id)}
                          </p>
                          <p className="text-sm text-secondary-brand">
                            {getServiceName(apt.service_id)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-primary-brand">
                            {formatTime(apt.start_time)}
                          </p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            apt.status === 'canceled'
                              ? 'bg-red-100 text-red-700'
                              : apt.status === 'completed'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-accent-wash text-accent'
                          }`}>
                            {apt.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-secondary-brand">
                  <Calendar size={40} className="mx-auto mb-2 opacity-50" />
                  <p>No appointments today</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Appointments */}
          <Card className="border border-black/5">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-primary-brand">Upcoming</CardTitle>
                <Link to="/app/agenda/calendar" className="text-sm text-accent hover:underline">
                  View all
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {stats?.upcoming_appointments?.length > 0 ? (
                <div className="space-y-3">
                  {stats.upcoming_appointments.slice(0, 5).map((apt) => (
                    <div
                      key={apt.appointment_id}
                      className="p-3 rounded-xl bg-white border border-black/5"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-primary-brand">
                            {getClientName(apt.client_id)}
                          </p>
                          <p className="text-sm text-secondary-brand">
                            {getServiceName(apt.service_id)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-primary-brand">
                            {new Date(apt.start_time).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                          </p>
                          <p className="text-sm text-secondary-brand">
                            {formatTime(apt.start_time)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-secondary-brand">
                  <Clock size={40} className="mx-auto mb-2 opacity-50" />
                  <p>No upcoming appointments</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AgendaLayout>
  );
};

export default Dashboard;
