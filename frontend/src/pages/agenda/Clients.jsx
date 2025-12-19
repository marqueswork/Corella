import React, { useState, useEffect } from 'react';
import AgendaLayout from '../../components/agenda/AgendaLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  User,
  Mail,
  Phone,
  Calendar
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Clients = ({ business }) => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', notes: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (business?.business_id) {
      fetchClients();
    }
  }, [business]);

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
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = editingClient
        ? `${API}/agenda/businesses/${business.business_id}/clients/${editingClient.client_id}`
        : `${API}/agenda/businesses/${business.business_id}/clients`;
      
      const res = await fetch(url, {
        method: editingClient ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        fetchClients();
        closeModal();
      }
    } catch (error) {
      console.error('Failed to save client:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (clientId) => {
    if (!window.confirm('Are you sure you want to delete this client?')) return;

    try {
      const res = await fetch(
        `${API}/agenda/businesses/${business.business_id}/clients/${clientId}`,
        { method: 'DELETE', credentials: 'include' }
      );
      if (res.ok) {
        fetchClients();
      }
    } catch (error) {
      console.error('Failed to delete client:', error);
    }
  };

  const openEditModal = (client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      email: client.email || '',
      phone: client.phone || '',
      notes: client.notes || ''
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingClient(null);
    setFormData({ name: '', email: '', phone: '', notes: '' });
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(search.toLowerCase()) ||
    client.email?.toLowerCase().includes(search.toLowerCase()) ||
    client.phone?.includes(search)
  );

  return (
    <AgendaLayout business={business}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-primary-brand">Clients</h1>
            <p className="text-secondary-brand">Manage your client database</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Plus size={20} />
            Add Client
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-brand" />
          <Input
            type="text"
            placeholder="Search clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-12 rounded-xl"
          />
        </div>

        {/* Clients list */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-[#8FEC78] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredClients.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredClients.map((client) => (
              <Card key={client.client_id} className="border border-black/5 card-hover">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8FEC78] to-[#81DD67] flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {client.name[0]?.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-primary-brand">{client.name}</h3>
                        {client.email && (
                          <p className="text-sm text-secondary-brand flex items-center gap-1">
                            <Mail size={12} />
                            {client.email}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => openEditModal(client)}
                        className="p-2 rounded-lg hover:bg-black/5 text-secondary-brand"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(client.client_id)}
                        className="p-2 rounded-lg hover:bg-red-50 text-red-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  {client.phone && (
                    <p className="text-sm text-secondary-brand flex items-center gap-1 mt-2">
                      <Phone size={12} />
                      {client.phone}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border border-black/5">
            <CardContent className="py-12 text-center">
              <User size={48} className="mx-auto text-muted-brand mb-4" />
              <h3 className="text-lg font-medium text-primary-brand mb-2">
                {search ? 'No clients found' : 'No clients yet'}
              </h3>
              <p className="text-secondary-brand mb-4">
                {search ? 'Try a different search term' : 'Add your first client to get started'}
              </p>
              {!search && (
                <button onClick={() => setShowModal(true)} className="btn-primary">
                  <Plus size={20} className="mr-2" />
                  Add Client
                </button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md border border-black/5">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{editingClient ? 'Edit Client' : 'Add Client'}</CardTitle>
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
                    className="h-10 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-brand mb-1">Email</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="h-10 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-brand mb-1">Phone</label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="h-10 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-brand mb-1">Notes</label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="rounded-lg resize-none"
                    rows={3}
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={closeModal} className="btn-secondary flex-1">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving} className="btn-primary flex-1">
                    {saving ? 'Saving...' : editingClient ? 'Update' : 'Add Client'}
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

export default Clients;
