import React, { useState, useEffect } from 'react';
import AgendaLayout from '../../components/agenda/AgendaLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Save, Clock, Globe, Link as LinkIcon, Users } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Settings = ({ business, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    timezone: '',
    working_hours: {}
  });

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  useEffect(() => {
    if (business) {
      setFormData({
        name: business.name,
        timezone: business.timezone,
        working_hours: business.working_hours || {}
      });
    }
  }, [business]);

  const handleSave = async () => {
    setLoading(true);
    setSaved(false);

    try {
      const res = await fetch(`${API}/agenda/businesses/${business.business_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setSaved(true);
        if (onUpdate) onUpdate({ ...business, ...formData });
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateWorkingHours = (day, field, value) => {
    setFormData({
      ...formData,
      working_hours: {
        ...formData.working_hours,
        [day]: {
          ...formData.working_hours[day],
          [field]: field === 'enabled' ? value : value
        }
      }
    });
  };

  const bookingUrl = `${window.location.origin}/agenda/${business?.slug}`;

  return (
    <AgendaLayout business={business}>
      <div className="space-y-6 max-w-3xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary-brand">Settings</h1>
            <p className="text-secondary-brand">Manage your business settings</p>
          </div>
          <button
            onClick={handleSave}
            disabled={loading}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Save size={20} />
            {loading ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
          </button>
        </div>

        {/* Business Info */}
        <Card className="border border-black/5">
          <CardHeader>
            <CardTitle>Business Information</CardTitle>
            <CardDescription>Basic information about your business</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-primary-brand mb-1">Business Name</label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="h-10 rounded-lg max-w-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-brand mb-1">
                <Globe size={14} className="inline mr-1" />Timezone
              </label>
              <select
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                className="h-10 px-3 rounded-lg border border-black/10 bg-white max-w-md w-full"
              >
                <option value="America/New_York">Eastern Time (ET)</option>
                <option value="America/Chicago">Central Time (CT)</option>
                <option value="America/Denver">Mountain Time (MT)</option>
                <option value="America/Los_Angeles">Pacific Time (PT)</option>
                <option value="America/Sao_Paulo">Brasilia Time (BRT)</option>
                <option value="Europe/London">London (GMT)</option>
                <option value="Europe/Paris">Paris (CET)</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Public Booking Link */}
        <Card className="border border-black/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LinkIcon size={20} />
              Public Booking Link
            </CardTitle>
            <CardDescription>Share this link with your clients for online booking</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 p-3 bg-[#fafafa] rounded-lg">
              <code className="flex-1 text-sm text-primary-brand truncate">{bookingUrl}</code>
              <button
                onClick={() => navigator.clipboard.writeText(bookingUrl)}
                className="btn-secondary text-sm py-2 px-3"
              >
                Copy
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Working Hours */}
        <Card className="border border-black/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock size={20} />
              Working Hours
            </CardTitle>
            <CardDescription>Set your business hours for each day</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {days.map((day) => {
                const dayHours = formData.working_hours[day] || { start: '09:00', end: '18:00', enabled: false };
                return (
                  <div key={day} className="flex items-center gap-4 p-3 bg-[#fafafa] rounded-lg">
                    <label className="flex items-center gap-2 w-32">
                      <input
                        type="checkbox"
                        checked={dayHours.enabled}
                        onChange={(e) => updateWorkingHours(day, 'enabled', e.target.checked)}
                        className="w-4 h-4 rounded border-black/20 text-[#8FEC78] focus:ring-[#8FEC78]"
                      />
                      <span className="capitalize text-sm font-medium text-primary-brand">{day}</span>
                    </label>
                    {dayHours.enabled && (
                      <div className="flex items-center gap-2">
                        <Input
                          type="time"
                          value={dayHours.start}
                          onChange={(e) => updateWorkingHours(day, 'start', e.target.value)}
                          className="h-9 w-28 rounded-lg text-sm"
                        />
                        <span className="text-secondary-brand">to</span>
                        <Input
                          type="time"
                          value={dayHours.end}
                          onChange={(e) => updateWorkingHours(day, 'end', e.target.value)}
                          className="h-9 w-28 rounded-lg text-sm"
                        />
                      </div>
                    )}
                    {!dayHours.enabled && (
                      <span className="text-sm text-muted-brand">Closed</span>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Plan Info */}
        <Card className="border border-black/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users size={20} />
              Current Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-accent-wash rounded-xl">
              <div>
                <p className="font-semibold text-primary-brand capitalize">{business?.plan || 'Basic'} Plan</p>
                <p className="text-sm text-secondary-brand">Manage your subscription</p>
              </div>
              <button className="btn-secondary text-sm">
                Upgrade
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AgendaLayout>
  );
};

export default Settings;
