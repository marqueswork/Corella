import React, { useState, useEffect } from 'react';
import AgendaLayout from '../../components/agenda/AgendaLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Clock,
  User,
  Briefcase
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Calendar = ({ business }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('week');
  const [appointments, setAppointments] = useState([]);
  const [clients, setClients] = useState([]);
  const [services, setServices] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [formData, setFormData] = useState({
    client_id: '',
    service_id: '',
    staff_id: '',
    start_time: '',
    notes: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (business?.business_id) {
      fetchData();
    }
  }, [business, currentDate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const startDate = getWeekStart(currentDate).toISOString();
      const endDate = new Date(getWeekStart(currentDate).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();

      const [aptsRes, clientsRes, servicesRes, staffRes] = await Promise.all([
        fetch(`${API}/agenda/businesses/${business.business_id}/appointments?start_date=${startDate}&end_date=${endDate}`, { credentials: 'include' }),
        fetch(`${API}/agenda/businesses/${business.business_id}/clients`, { credentials: 'include' }),
        fetch(`${API}/agenda/businesses/${business.business_id}/services`, { credentials: 'include' }),
        fetch(`${API}/agenda/businesses/${business.business_id}/staff`, { credentials: 'include' })
      ]);

      if (aptsRes.ok) setAppointments(await aptsRes.json());
      if (clientsRes.ok) setClients(await clientsRes.json());
      if (servicesRes.ok) setServices(await servicesRes.json());
      if (staffRes.ok) setStaff(await staffRes.json());
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWeekStart = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  };

  const getWeekDays = () => {
    const start = getWeekStart(currentDate);
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      return day;
    });
  };

  const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM to 7 PM

  const getAppointmentsForSlot = (date, hour) => {
    return appointments.filter(apt => {
      const aptDate = new Date(apt.start_time);
      return aptDate.getDate() === date.getDate() &&
             aptDate.getMonth() === date.getMonth() &&
             aptDate.getFullYear() === date.getFullYear() &&
             aptDate.getHours() === hour;
    });
  };

  const navigateWeek = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction * 7));
    setCurrentDate(newDate);
  };

  const goToToday = () => setCurrentDate(new Date());

  const openNewAppointment = (date, hour) => {
    const startTime = new Date(date);
    startTime.setHours(hour, 0, 0, 0);
    setSelectedSlot({ date, hour });
    setFormData({
      client_id: '',
      service_id: '',
      staff_id: staff[0]?.staff_id || '',
      start_time: startTime.toISOString().slice(0, 16),
      notes: ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`${API}/agenda/businesses/${business.business_id}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          start_time: new Date(formData.start_time).toISOString()
        })
      });

      if (res.ok) {
        fetchData();
        setShowModal(false);
      } else {
        const error = await res.json();
        alert(error.detail || 'Failed to create appointment');
      }
    } catch (error) {
      console.error('Failed to save appointment:', error);
    } finally {
      setSaving(false);
    }
  };

  const updateAppointmentStatus = async (appointmentId, status) => {
    try {
      await fetch(`${API}/agenda/businesses/${business.business_id}/appointments/${appointmentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status })
      });
      fetchData();
    } catch (error) {
      console.error('Failed to update appointment:', error);
    }
  };

  const getClientName = (clientId) => clients.find(c => c.client_id === clientId)?.name || 'Unknown';
  const getServiceName = (serviceId) => services.find(s => s.service_id === serviceId)?.name || 'Service';

  const formatDateHeader = (date) => {
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    return {
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      date: date.getDate(),
      isToday
    };
  };

  return (
    <AgendaLayout business={business}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-primary-brand">Calendar</h1>
            <div className="flex items-center gap-2">
              <button onClick={() => navigateWeek(-1)} className="p-2 rounded-lg hover:bg-black/5">
                <ChevronLeft size={20} />
              </button>
              <button onClick={goToToday} className="px-3 py-1 text-sm rounded-lg hover:bg-black/5">
                Today
              </button>
              <button onClick={() => navigateWeek(1)} className="p-2 rounded-lg hover:bg-black/5">
                <ChevronRight size={20} />
              </button>
            </div>
            <span className="text-secondary-brand">
              {getWeekStart(currentDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
          </div>
          <button onClick={() => setShowModal(true)} className="btn-primary inline-flex items-center gap-2">
            <Plus size={20} />
            New Appointment
          </button>
        </div>

        {/* Calendar Grid */}
        <Card className="border border-black/5 overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Header row */}
              <div className="grid grid-cols-8 border-b border-black/5">
                <div className="p-3 text-sm text-secondary-brand">Time</div>
                {getWeekDays().map((day, i) => {
                  const { day: dayName, date, isToday } = formatDateHeader(day);
                  return (
                    <div key={i} className={`p-3 text-center border-l border-black/5 ${isToday ? 'bg-accent-wash' : ''}`}>
                      <div className="text-sm text-secondary-brand">{dayName}</div>
                      <div className={`text-lg font-semibold ${isToday ? 'text-accent' : 'text-primary-brand'}`}>
                        {date}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Time slots */}
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="w-8 h-8 border-4 border-[#8FEC78] border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                hours.map((hour) => (
                  <div key={hour} className="grid grid-cols-8 border-b border-black/5 min-h-[80px]">
                    <div className="p-2 text-sm text-secondary-brand border-r border-black/5">
                      {hour}:00
                    </div>
                    {getWeekDays().map((day, dayIndex) => {
                      const slotAppointments = getAppointmentsForSlot(day, hour);
                      const isToday = day.toDateString() === new Date().toDateString();
                      return (
                        <div
                          key={dayIndex}
                          onClick={() => slotAppointments.length === 0 && openNewAppointment(day, hour)}
                          className={`p-1 border-l border-black/5 cursor-pointer hover:bg-black/5 transition-colors ${
                            isToday ? 'bg-accent-wash/30' : ''
                          }`}
                        >
                          {slotAppointments.map((apt) => (
                            <div
                              key={apt.appointment_id}
                              onClick={(e) => e.stopPropagation()}
                              className={`p-2 rounded-lg text-xs mb-1 ${
                                apt.status === 'canceled'
                                  ? 'bg-red-100 text-red-800'
                                  : apt.status === 'completed'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-accent-wash text-primary-brand'
                              }`}
                            >
                              <div className="font-medium truncate">{getClientName(apt.client_id)}</div>
                              <div className="truncate opacity-75">{getServiceName(apt.service_id)}</div>
                              {apt.status === 'scheduled' && (
                                <div className="flex gap-1 mt-1">
                                  <button
                                    onClick={() => updateAppointmentStatus(apt.appointment_id, 'completed')}
                                    className="px-1.5 py-0.5 bg-green-500 text-white rounded text-[10px]"
                                  >
                                    Done
                                  </button>
                                  <button
                                    onClick={() => updateAppointmentStatus(apt.appointment_id, 'canceled')}
                                    className="px-1.5 py-0.5 bg-red-500 text-white rounded text-[10px]"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                ))
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* New Appointment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md border border-black/5">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>New Appointment</CardTitle>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-black/5">
                <X size={20} />
              </button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-primary-brand mb-1">
                    <User size={14} className="inline mr-1" />Client *
                  </label>
                  <select
                    value={formData.client_id}
                    onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-black/10 bg-white"
                    required
                  >
                    <option value="">Select client</option>
                    {clients.map((client) => (
                      <option key={client.client_id} value={client.client_id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-brand mb-1">
                    <Briefcase size={14} className="inline mr-1" />Service *
                  </label>
                  <select
                    value={formData.service_id}
                    onChange={(e) => setFormData({ ...formData, service_id: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-black/10 bg-white"
                    required
                  >
                    <option value="">Select service</option>
                    {services.filter(s => s.is_active).map((service) => (
                      <option key={service.service_id} value={service.service_id}>
                        {service.name} ({service.duration} min - ${service.price})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-brand mb-1">Staff *</label>
                  <select
                    value={formData.staff_id}
                    onChange={(e) => setFormData({ ...formData, staff_id: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-black/10 bg-white"
                    required
                  >
                    {staff.filter(s => s.is_active).map((s) => (
                      <option key={s.staff_id} value={s.staff_id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-brand mb-1">
                    <Clock size={14} className="inline mr-1" />Date & Time *
                  </label>
                  <Input
                    type="datetime-local"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    className="h-10 rounded-lg"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving} className="btn-primary flex-1">
                    {saving ? 'Creating...' : 'Create Appointment'}
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </AgendaLayout>
  );
};

export default Calendar;
