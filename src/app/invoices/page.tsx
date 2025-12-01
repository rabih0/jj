'use client';

import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, initializeSeedData } from '@/lib/db';
import { useRouter } from 'next/navigation';
import { Plus, Search, FileText, Trash2, Eye, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { generateAndDownloadInvoicePDF } from '@/lib/pdfGenerator';


export default function InvoicesPage() {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    const invoices = useLiveQuery(() => db.invoices.toArray());
    const clients = useLiveQuery(() => db.clients.toArray());

    useEffect(() => {
        initializeSeedData();
    }, []);

    const getClientName = (clientId: string) => {
        const client = clients?.find(c => c.id === clientId);
        return client?.name || 'Unknown Client';
    };

    const filteredInvoices = invoices?.filter(invoice => {
        const clientName = getClientName(invoice.clientId);
        const matchesSearch =
            invoice.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            clientName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const deleteInvoice = async (id: string) => {
        if (confirm('Möchten Sie diese Rechnung wirklich löschen?')) {
            await db.invoices.delete(id);
        }
    };

    const downloadInvoicePDF = async (invoiceId: string) => {
        const invoice = invoices?.find(inv => inv.id === invoiceId);
        if (!invoice) return;

        const client = clients?.find(c => c.id === invoice.clientId);
        if (!client) {
            alert('Kunde nicht gefunden');
            return;
        }

        try {
            await generateAndDownloadInvoicePDF(invoice, client);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Fehler beim Erstellen der PDF');
        }
    };


    const getStatusColor = (status: string) => {
        switch (status) {
            case 'draft': return 'bg-gray-100 text-gray-800';
            case 'sent': return 'bg-blue-100 text-blue-800';
            case 'paid': return 'bg-green-100 text-green-800';
            case 'overdue': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'draft': return 'Entwurf';
            case 'sent': return 'Versendet';
            case 'paid': return 'Bezahlt';
            case 'overdue': return 'Überfällig';
            default: return status;
        }
    };

    return (
        <div className="pb-24 pt-8 px-4 max-w-4xl mx-auto">
            <header className="mb-6">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-primary mb-1">Rechnungen</h1>
                        <p className="text-muted-foreground">
                            {filteredInvoices?.length || 0} Rechnung(en)
                        </p>
                    </div>
                    <button
                        onClick={() => router.push('/invoices/new')}
                        className="glass-button flex items-center gap-2"
                    >
                        <Plus size={16} />
                        <span className="hidden sm:inline">Neue Rechnung</span>
                        <span className="sm:hidden">Neu</span>
                    </button>
                </div>

                {/* Search and Filter */}
                <div className="glass-card">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                            <input
                                type="text"
                                placeholder="Rechnung oder Kunde suchen..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="glass-input w-full pl-10"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="glass-input sm:w-48"
                        >
                            <option value="all">Alle Status</option>
                            <option value="draft">Entwurf</option>
                            <option value="sent">Versendet</option>
                            <option value="paid">Bezahlt</option>
                            <option value="overdue">Überfällig</option>
                        </select>
                    </div>
                </div>
            </header>

            {/* Invoices List */}
            {!filteredInvoices || filteredInvoices.length === 0 ? (
                <div className="glass-card text-center py-12">
                    <FileText size={40} className="mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">Keine Rechnungen gefunden</h3>
                    <p className="text-muted-foreground mb-6">
                        {searchTerm || statusFilter !== 'all'
                            ? 'Versuchen Sie, Ihre Suchkriterien anzupassen'
                            : 'Erstellen Sie Ihre erste Rechnung'}
                    </p>
                    {!searchTerm && statusFilter === 'all' && (
                        <button
                            onClick={() => router.push('/invoices/new')}
                            className="glass-button inline-flex items-center gap-2"
                        >
                            <Plus size={16} />
                            Neue Rechnung erstellen
                        </button>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredInvoices.map((invoice, index) => (
                        <motion.div
                            key={invoice.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="glass-card hover:shadow-lg transition-shadow"
                        >
                            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-bold">{invoice.number}</h3>
                                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(invoice.status)}`}>
                                            {getStatusLabel(invoice.status)}
                                        </span>
                                    </div>
                                    <p className="text-muted-foreground mb-1">
                                        {getClientName(invoice.clientId)}
                                    </p>
                                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                        <span>
                                            Datum: {new Date(invoice.date).toLocaleDateString('de-DE')}
                                        </span>
                                        {invoice.dueDate && (
                                            <span>
                                                Fällig: {new Date(invoice.dueDate).toLocaleDateString('de-DE')}
                                            </span>
                                        )}
                                        <span>
                                            {invoice.items.length} Position(en)
                                        </span>
                                    </div>
                                </div>

                                <div className="flex sm:flex-col items-center sm:items-end gap-3">
                                    <div className="text-right">
                                        <p className="text-2xl font-bold">€{invoice.total.toFixed(2)}</p>
                                        <p className="text-xs text-muted-foreground">inkl. MwSt.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200/50">
                                <button
                                    onClick={() => router.push(`/invoices/${invoice.id}`)}
                                    className="flex-1 glass-button text-sm py-2 flex items-center justify-center gap-2"
                                    title="Ansehen"
                                >
                                    <Eye size={16} />
                                    Ansehen
                                </button>
                                <button
                                    onClick={() => downloadInvoicePDF(invoice.id)}
                                    className="flex-1 glass-button text-sm py-2 flex items-center justify-center gap-2"
                                    title="PDF herunterladen"
                                >
                                    <Download size={16} />
                                    PDF
                                </button>
                                <button
                                    onClick={() => deleteInvoice(invoice.id)}
                                    className="glass-button text-sm py-2 px-3 flex items-center justify-center text-red-600 hover:bg-red-50"
                                    title="Löschen"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
