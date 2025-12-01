'use client';

import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, initializeSeedData, type Client } from '@/lib/db';
import { Plus, Search, Edit, Trash2, Mail, Phone, MapPin, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ClientsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: ''
    });

    const clients = useLiveQuery(() => db.clients.toArray());

    useEffect(() => {
        initializeSeedData();
    }, []);

    const filteredClients = clients?.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.phone?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const openModal = (client?: Client) => {
        if (client) {
            setEditingClient(client);
            setFormData({
                name: client.name,
                email: client.email || '',
                phone: client.phone || '',
                address: client.address || ''
            });
        } else {
            setEditingClient(null);
            setFormData({ name: '', email: '', phone: '', address: '' });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingClient(null);
        setFormData({ name: '', email: '', phone: '', address: '' });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            alert('Bitte geben Sie einen Namen ein');
            return;
        }

        if (editingClient) {
            // Update existing client
            await db.clients.update(editingClient.id, {
                name: formData.name,
                email: formData.email || undefined,
                phone: formData.phone || undefined,
                address: formData.address || undefined
            });
        } else {
            // Create new client
            await db.clients.add({
                id: crypto.randomUUID(),
                name: formData.name,
                email: formData.email || undefined,
                phone: formData.phone || undefined,
                address: formData.address || undefined,
                createdAt: new Date()
            });
        }

        closeModal();
    };

    const deleteClient = async (id: string) => {
        if (confirm('Möchten Sie diesen Kunden wirklich löschen?')) {
            await db.clients.delete(id);
        }
    };

    return (
        <div className="pb-24 pt-8 px-4 max-w-4xl mx-auto">
            <header className="mb-6">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-primary mb-1">Kunden</h1>
                        <p className="text-muted-foreground">
                            {filteredClients?.length || 0} Kunde(n)
                        </p>
                    </div>
                    <button
                        onClick={() => openModal()}
                        className="glass-button flex items-center gap-2"
                    >
                        <Plus size={18} />
                        Neuer Kunde
                    </button>
                </div>

                {/* Search */}
                <div className="glass-card">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <input
                            type="text"
                            placeholder="Kunde suchen..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="glass-input w-full pl-10"
                        />
                    </div>
                </div>
            </header>

            {/* Clients List */}
            {!filteredClients || filteredClients.length === 0 ? (
                <div className="glass-card text-center py-12">
                    <Mail size={48} className="mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">Keine Kunden gefunden</h3>
                    <p className="text-muted-foreground mb-6">
                        {searchTerm
                            ? 'Versuchen Sie, Ihre Suchkriterien anzupassen'
                            : 'Fügen Sie Ihren ersten Kunden hinzu'}
                    </p>
                    {!searchTerm && (
                        <button
                            onClick={() => openModal()}
                            className="glass-button inline-flex items-center gap-2"
                        >
                            <Plus size={18} />
                            Neuer Kunde
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredClients.map((client, index) => (
                        <motion.div
                            key={client.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="glass-card hover:shadow-lg transition-shadow"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <h3 className="text-lg font-bold">{client.name}</h3>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => openModal(client)}
                                        className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                                        title="Bearbeiten"
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button
                                        onClick={() => deleteClient(client.id)}
                                        className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                                        title="Löschen"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2 text-sm">
                                {client.email && (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Mail size={14} />
                                        <span>{client.email}</span>
                                    </div>
                                )}
                                {client.phone && (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Phone size={14} />
                                        <span>{client.phone}</span>
                                    </div>
                                )}
                                {client.address && (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <MapPin size={14} />
                                        <span>{client.address}</span>
                                    </div>
                                )}
                            </div>

                            <div className="mt-3 pt-3 border-t border-gray-200/50 text-xs text-muted-foreground">
                                Erstellt: {new Date(client.createdAt).toLocaleDateString('de-DE')}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={closeModal}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="glass-card w-full max-w-md"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold">
                                    {editingClient ? 'Kunde bearbeiten' : 'Neuer Kunde'}
                                </h2>
                                <button
                                    onClick={closeModal}
                                    className="p-2 hover:bg-white/20 rounded-lg"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="glass-input w-full"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        E-Mail
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="glass-input w-full"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Telefon
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="glass-input w-full"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Adresse
                                    </label>
                                    <textarea
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        className="glass-input w-full"
                                        rows={3}
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="flex-1 glass-button"
                                    >
                                        Abbrechen
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:opacity-90"
                                    >
                                        {editingClient ? 'Aktualisieren' : 'Erstellen'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
