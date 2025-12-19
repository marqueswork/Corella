import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Calendar, ArrowRight, Building2 } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Onboarding = ({ onComplete }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/New_York'
  });

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API}/agenda/businesses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        const business = await res.json();
        onComplete(business);
      } else {
        const data = await res.json();
        setError(data.detail || 'Failed to create business');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen hero-gradient flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <Card className="border border-black/5 shadow-lg">
          <CardContent className="p-8">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#8FEC78] to-[#81DD67] flex items-center justify-center">
                <Calendar size={28} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-primary-brand">Corella Agenda</h1>
                <p className="text-sm text-secondary-brand">Let&apos;s set up your business</p>
              </div>
            </div>

            {/* Progress */}
            <div className="flex gap-2 mb-8">
              <div className={`h-1 flex-1 rounded-full ${step >= 1 ? 'bg-[#8FEC78]' : 'bg-black/10'}`} />
              <div className={`h-1 flex-1 rounded-full ${step >= 2 ? 'bg-[#8FEC78]' : 'bg-black/10'}`} />
            </div>

            <form onSubmit={handleSubmit}>
              {step === 1 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-accent-wash flex items-center justify-center mx-auto mb-4">
                      <Building2 size={32} className="text-accent" />
                    </div>
                    <h2 className="text-xl font-bold text-primary-brand mb-2">
                      What&apos;s your business name?
                    </h2>
                    <p className="text-secondary-brand">
                      This will be displayed to your clients
                    </p>
                  </div>

                  <div>
                    <Input
                      type="text"
                      placeholder="e.g., Maria's Hair Salon"
                      value={formData.name}
                      onChange={handleNameChange}
                      className="h-12 rounded-xl text-center text-lg"
                      required
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => formData.name && setStep(2)}
                    disabled={!formData.name}
                    className="btn-primary w-full"
                  >
                    Continue
                    <ArrowRight className="ml-2" size={20} />
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h2 className="text-xl font-bold text-primary-brand mb-2">
                      Your booking page URL
                    </h2>
                    <p className="text-secondary-brand">
                      Clients will use this link to book appointments
                    </p>
                  </div>

                  <div className="bg-[#fafafa] rounded-xl p-4">
                    <p className="text-sm text-secondary-brand mb-2">Your booking link:</p>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-brand">corella.com/agenda/</span>
                      <Input
                        type="text"
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: generateSlug(e.target.value) })}
                        className="h-10 rounded-lg flex-1"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-primary-brand mb-2">
                      Timezone
                    </label>
                    <select
                      value={formData.timezone}
                      onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                      className="w-full h-12 px-4 rounded-xl border border-black/10 bg-white focus:outline-none focus:ring-2 focus:ring-[#8FEC78]"
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

                  {error && (
                    <p className="text-red-500 text-sm text-center">{error}</p>
                  )}

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="btn-secondary flex-1"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading || !formData.slug}
                      className="btn-primary flex-1"
                    >
                      {loading ? 'Creating...' : 'Create Business'}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Onboarding;
