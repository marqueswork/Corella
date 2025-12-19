import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import {
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  CheckCircle,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Briefcase
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const PublicBooking = () => {
  const { slug } = useParams();
  const [business, setBusiness] = useState(null);
  const [services, setServices] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [booking, setBooking] = useState(false);
  const [booked, setBooked] = useState(null);

  const [formData, setFormData] = useState({
    client_name: '',
    client_email: '',
    client_phone: ''
  });

  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    fetchBusiness();
  }, [slug]);

  useEffect(() => {
    if (selectedService && selectedStaff && selectedDate) {
      fetchAvailableSlots();
    }
  }, [selectedService, selectedStaff, selectedDate]);

  const fetchBusiness = async () => {
    try {
      const res = await fetch(`${API}/agenda/public/${slug}`);
      if (res.ok) {
        const data = await res.json();
        setBusiness(data.business);
        setServices(data.services);
        setStaff(data.staff);
        if (data.staff.length === 1) {
          setSelectedStaff(data.staff[0]);
        }
      } else {
        setError('Business not found');
      }
    } catch (err) {
      setError('Failed to load booking page');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSlots = async () => {
    setLoadingSlots(true);
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const res = await fetch(
        `${API}/agenda/public/${slug}/available-slots?staff_id=${selectedStaff.staff_id}&service_id=${selectedService.service_id}&date=${dateStr}`
      );
      if (res.ok) {
        const data = await res.json();
        setAvailableSlots(data.slots);
      }
    } catch (err) {
      console.error('Failed to fetch slots:', err);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleBook = async (e) => {
    e.preventDefault();
    setBooking(true);

    try {
      const res = await fetch(`${API}/agenda/public/${slug}/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          service_id: selectedService.service_id,
          staff_id: selectedStaff.staff_id,
          start_time: selectedSlot.datetime
        })
      });

      if (res.ok) {
        const data = await res.json();
        setBooked(data);
        setStep(5);
      } else {
        const err = await res.json();
        alert(err.detail || 'Failed to book appointment');
      }
    } catch (err) {
      alert('Something went wrong. Please try again.');
    } finally {
      setBooking(false);
    }
  };

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    // Add empty days for alignment
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    // Add days of month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const isDateSelectable = (date) => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-12 h-12 border-4 border-[#8FEC78] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-6">
        <Card className="max-w-md w-full border border-black/5">
          <CardContent className="py-12 text-center">
            <h2 className="text-xl font-bold text-primary-brand mb-2">{error}</h2>
            <p className="text-secondary-brand mb-4">This business may not exist or has been removed.</p>
            <Link to="/" className="btn-secondary">Go to Homepage</Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Header */}
      <header className="bg-white border-b border-black/5">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8FEC78] to-[#81DD67] flex items-center justify-center">
              <Calendar size={20} className="text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-primary-brand">{business?.name}</h1>
              <p className="text-sm text-secondary-brand">Online Booking</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`w-3 h-3 rounded-full transition-colors ${
                s <= step ? 'bg-[#8FEC78]' : 'bg-black/10'
              }`}
            />
          ))}
        </div>

        {/* Step 1: Select Service */}
        {step === 1 && (
          <Card className="border border-black/5">
            <CardHeader>
              <CardTitle>Select a Service</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {services.map((service) => (
                  <button
                    key={service.service_id}
                    onClick={() => {
                      setSelectedService(service);
                      setStep(2);
                    }}
                    className="w-full p-4 rounded-xl border border-black/5 hover:border-[#8FEC78] hover:bg-accent-wash transition-colors text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-primary-brand">{service.name}</h3>
                        {service.description && (
                          <p className="text-sm text-secondary-brand mt-1">{service.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-2 text-sm text-secondary-brand">
                          <span className="flex items-center gap-1">
                            <Clock size={14} />
                            {service.duration} min
                          </span>
                        </div>
                      </div>
                      <span className="font-semibold text-accent">{formatPrice(service.price)}</span>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Select Staff (if multiple) & Date */}
        {step === 2 && (
          <Card className="border border-black/5">
            <CardHeader>
              <div className="flex items-center gap-2">
                <button onClick={() => setStep(1)} className="p-1 rounded hover:bg-black/5">
                  <ArrowLeft size={20} />
                </button>
                <CardTitle>Select Date</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Staff selection (if multiple) */}
              {staff.length > 1 && (
                <div>
                  <label className="block text-sm font-medium text-primary-brand mb-2">Select Staff</label>
                  <div className="flex flex-wrap gap-2">
                    {staff.map((s) => (
                      <button
                        key={s.staff_id}
                        onClick={() => setSelectedStaff(s)}
                        className={`px-4 py-2 rounded-full border transition-colors ${
                          selectedStaff?.staff_id === s.staff_id
                            ? 'bg-[#8FEC78] border-[#8FEC78] text-white'
                            : 'border-black/10 hover:border-[#8FEC78]'
                        }`}
                      >
                        {s.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Calendar */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                    className="p-2 rounded-lg hover:bg-black/5"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <span className="font-medium text-primary-brand">
                    {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </span>
                  <button
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                    className="p-2 rounded-lg hover:bg-black/5"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center text-sm">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="py-2 text-secondary-brand font-medium">{day}</div>
                  ))}
                  {getDaysInMonth().map((date, i) => (
                    <button
                      key={i}
                      onClick={() => date && isDateSelectable(date) && selectedStaff && setSelectedDate(date)}
                      disabled={!date || !isDateSelectable(date) || !selectedStaff}
                      className={`py-2 rounded-lg transition-colors ${
                        !date
                          ? ''
                          : !isDateSelectable(date) || !selectedStaff
                          ? 'text-muted-brand cursor-not-allowed'
                          : selectedDate?.toDateString() === date.toDateString()
                          ? 'bg-[#8FEC78] text-white font-medium'
                          : 'hover:bg-accent-wash'
                      }`}
                    >
                      {date?.getDate()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time slots */}
              {selectedDate && selectedStaff && (
                <div>
                  <label className="block text-sm font-medium text-primary-brand mb-2">Available Times</label>
                  {loadingSlots ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="w-6 h-6 border-2 border-[#8FEC78] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : availableSlots.length > 0 ? (
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                      {availableSlots.map((slot) => (
                        <button
                          key={slot.time}
                          onClick={() => {
                            setSelectedSlot(slot);
                            setStep(3);
                          }}
                          className="px-3 py-2 text-sm rounded-lg border border-black/10 hover:border-[#8FEC78] hover:bg-accent-wash transition-colors"
                        >
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-secondary-brand py-4">No available times for this date</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 3: Enter Details */}
        {step === 3 && (
          <Card className="border border-black/5">
            <CardHeader>
              <div className="flex items-center gap-2">
                <button onClick={() => setStep(2)} className="p-1 rounded hover:bg-black/5">
                  <ArrowLeft size={20} />
                </button>
                <CardTitle>Your Details</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => { e.preventDefault(); setStep(4); }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-primary-brand mb-1">
                    <User size={14} className="inline mr-1" />Name *
                  </label>
                  <Input
                    type="text"
                    value={formData.client_name}
                    onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                    className="h-12 rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-brand mb-1">
                    <Mail size={14} className="inline mr-1" />Email *
                  </label>
                  <Input
                    type="email"
                    value={formData.client_email}
                    onChange={(e) => setFormData({ ...formData, client_email: e.target.value })}
                    className="h-12 rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-brand mb-1">
                    <Phone size={14} className="inline mr-1" />Phone (optional)
                  </label>
                  <Input
                    type="tel"
                    value={formData.client_phone}
                    onChange={(e) => setFormData({ ...formData, client_phone: e.target.value })}
                    className="h-12 rounded-xl"
                  />
                </div>
                <button type="submit" className="btn-primary w-full">
                  Review Booking
                </button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Confirm */}
        {step === 4 && (
          <Card className="border border-black/5">
            <CardHeader>
              <div className="flex items-center gap-2">
                <button onClick={() => setStep(3)} className="p-1 rounded hover:bg-black/5">
                  <ArrowLeft size={20} />
                </button>
                <CardTitle>Confirm Booking</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-[#fafafa] rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Briefcase size={18} className="text-secondary-brand" />
                  <div>
                    <p className="text-sm text-secondary-brand">Service</p>
                    <p className="font-medium text-primary-brand">{selectedService?.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar size={18} className="text-secondary-brand" />
                  <div>
                    <p className="text-sm text-secondary-brand">Date & Time</p>
                    <p className="font-medium text-primary-brand">
                      {selectedDate?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at {selectedSlot?.time}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <User size={18} className="text-secondary-brand" />
                  <div>
                    <p className="text-sm text-secondary-brand">With</p>
                    <p className="font-medium text-primary-brand">{selectedStaff?.name}</p>
                  </div>
                </div>
                <div className="pt-2 border-t border-black/5 flex justify-between">
                  <span className="text-secondary-brand">Total</span>
                  <span className="font-semibold text-accent">{formatPrice(selectedService?.price)}</span>
                </div>
              </div>

              <button
                onClick={handleBook}
                disabled={booking}
                className="btn-primary w-full"
              >
                {booking ? 'Booking...' : 'Confirm Booking'}
              </button>
            </CardContent>
          </Card>
        )}

        {/* Step 5: Success */}
        {step === 5 && booked && (
          <Card className="border border-black/5">
            <CardContent className="py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-accent-wash flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={32} className="text-accent" />
              </div>
              <h2 className="text-2xl font-bold text-primary-brand mb-2">Booking Confirmed!</h2>
              <p className="text-secondary-brand mb-6">
                Your appointment has been scheduled. We sent a confirmation to your email.
              </p>
              <div className="bg-[#fafafa] rounded-xl p-4 text-left max-w-sm mx-auto mb-6">
                <p className="text-sm text-secondary-brand">Appointment ID</p>
                <p className="font-mono text-primary-brand">{booked.appointment_id}</p>
              </div>
              <button
                onClick={() => {
                  setStep(1);
                  setSelectedService(null);
                  setSelectedDate(null);
                  setSelectedSlot(null);
                  setFormData({ client_name: '', client_email: '', client_phone: '' });
                  setBooked(null);
                }}
                className="btn-secondary"
              >
                Book Another Appointment
              </button>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-black/5 py-6 text-center">
        <p className="text-sm text-muted-brand">
          Powered by <Link to="/" className="text-accent hover:underline">Corella</Link>
        </p>
      </footer>
    </div>
  );
};

export default PublicBooking;
