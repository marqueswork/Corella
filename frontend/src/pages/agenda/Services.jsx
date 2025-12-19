import React, { useState, useEffect } from 'react';
import AgendaLayout from '../../components/agenda/AgendaLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import {
  Plus,
  Edit2,
  X,
  Briefcase,
  Clock,
  DollarSign,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Services = ({ business }) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({ name: '', duration: 30, price: 0, description: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (business?.business_id) {
      fetchServices();
    }
  }, [business]);

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
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = editingService
        ? `${API}/agenda/businesses/${business.business_id}/services/${editingService.service_id}`
        : `${API}/agenda/businesses/${business.business_id}/services`;
      
      const res = await fetch(url, {
        method: editingService ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          duration: parseInt(formData.duration),
          price: parseFloat(formData.price)
        })
      });

      if (res.ok) {
        fetchServices();
        closeModal();
      }
    } catch (error) {
      console.error('Failed to save service:', error);
    } finally {
      setSaving(false);
    }
  };

  const toggleService = async (service) => {
    try {
      await fetch(
        `${API}/agenda/businesses/${business.business_id}/services/${service.service_id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ is_active: !service.is_active })
        }
      );
      fetchServices();
    } catch (error) {
      console.error('Failed to toggle service:', error);
    }
  };

  const openEditModal = (service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      duration: service.duration,
      price: service.price,
      description: service.description || ''
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingService(null);
    setFormData({ name: '', duration: 30, price: 0, description: '' });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
  };

  return (
    <AgendaLayout business={business}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-primary-brand">Services</h1>
            <p className="text-secondary-brand">Manage your service offerings</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Plus size={20} />
            Add Service
          </button>
        </div>

        {/* Services list */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-[#8FEC78] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : services.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <Card
                key={service.service_id}
                className={`border card-hover ${
                  service.is_active ? 'border-black/5' : 'border-black/5 opacity-60'
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8FEC78] to-[#81DD67] flex items-center justify-center">
                      <Briefcase size={20} className="text-white" />
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => toggleService(service)}
                        className="p-2 rounded-lg hover:bg-black/5"
                        title={service.is_active ? 'Disable' : 'Enable'}
                      >
                        {service.is_active ? (
                          <ToggleRight size={20} className="text-accent" />
                        ) : (
                          <ToggleLeft size={20} className="text-muted-brand" />
                        )}
                      </button>
                      <button
                        onClick={() => openEditModal(service)}
                        className="p-2 rounded-lg hover:bg-black/5 text-secondary-brand"
                      >
                        <Edit2 size={16} />
                      </button>
                    </div>
                  </div>
                  <h3 className="font-semibold text-primary-brand mb-1">{service.name}</h3>
                  {service.description && (
                    <p className="text-sm text-secondary-brand mb-3 line-clamp-2">
                      {service.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1 text-secondary-brand">
                      <Clock size={14} />
                      {service.duration} min
                    </span>
                    <span className="flex items-center gap-1 font-medium text-accent">
                      <DollarSign size={14} />
                      {formatPrice(service.price)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border border-black/5">
            <CardContent className="py-12 text-center">
              <Briefcase size={48} className="mx-auto text-muted-brand mb-4" />
              <h3 className="text-lg font-medium text-primary-brand mb-2">No services yet</h3>
              <p className="text-secondary-brand mb-4">
                Add your first service to start accepting bookings
              </p>
              <button onClick={() => setShowModal(true)} className="btn-primary">
                <Plus size={20} className="mr-2" />
                Add Service
              </button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md border border-black/5">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{editingService ? 'Edit Service' : 'Add Service'}</CardTitle>
              <button onClick={closeModal} className="p-2 rounded-lg hover:bg-black/5">
                <X size={20} />
              </button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-primary-brand mb-1">Name *</label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Haircut"
                    className="h-10 rounded-lg"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-primary-brand mb-1">
                      Duration (min) *
                    </label>
                    <Input
                      type="number"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      min="5"
                      step="5"
                      className="h-10 rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary-brand mb-1">
                      Price ($) *
                    </label>
                    <Input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      min="0"
                      step="0.01"
                      className="h-10 rounded-lg"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-brand mb-1">Description</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Optional description..."
                    className="rounded-lg resize-none"
                    rows={3}
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={closeModal} className="btn-secondary flex-1">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving} className="btn-primary flex-1">
                    {saving ? 'Saving...' : editingService ? 'Update' : 'Add Service'}
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

export default Services;
