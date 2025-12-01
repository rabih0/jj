'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { db, getInvoiceWithClient } from '@/lib/db';
import { ArrowLeft, Download, Edit, Trash2, Calendar, User, FileText } from 'lucide-react';
import { generateAndDownloadInvoicePDF, generateAndPreviewInvoicePDF } from '@/lib/pdfGenerator';
import type { Invoice, Client } from '@/lib/db';

export default function InvoiceDetailPage() {
    const router = useRouter();
    const params = useParams();
    const invoiceId = params.id as string;

    const [invoice, setInvoice] = useState<Invoice | null>(null);
    const [client, setClient] = useState<Client | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (invoiceId) {
            loadInvoice();
        }
    }, [invoiceId]);


    const loadInvoice = async () => {
        try {
            const data = await getInvoiceWithClient(invoiceId);
            if (data) {
                setInvoice(data.invoice);
                setClient(data.client || null);
            }
        } catch (error) {
            console.error('Error loading invoice:', error);
        } finally {
            setLoading(false);
        }
    };



    const downloadPDF = async () => {
        if (!invoice || !client) return;
        try {
            await generateAndDownloadInvoicePDF(invoice, client);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Fehler beim Erstellen der PDF');
        }
    };

    const previewPDF = async () => {
        if (!invoice || !client) return;
        try {
            await generateAndPreviewInvoicePDF(invoice, client);
        } catch (error) {
            console.error('Error previewing PDF:', error);
            alert('Fehler beim Öffnen der Vorschau');
        }
    };

    const deleteInvoice = async () => {
        if (!invoice) return;
        if (confirm('Möchten Sie diese Rechnung wirklich löschen?')) {
            await db.invoices.delete(invoice.id);
            router.push('/invoices');
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

    if (loading) {
        return (
            <div className="pb-24 pt-8 px-4 max-w-4xl mx-auto">
                <div className="glass-card text-center py-12">
                    <p className="text-muted-foreground">Laden...</p>
                </div>
            </div>
        );
    }

    if (!invoice || !client) {
        return (
            <div className="pb-24 pt-8 px-4 max-w-4xl mx-auto">
                <div className="glass-card text-center py-12">
                    <FileText size={48} className="mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">Rechnung nicht gefunden</h3>
                    <p className="text-muted-foreground mb-6">
                        Die angeforderte Rechnung existiert nicht.
                    </p>
                    <button
                        onClick={() => router.push('/invoices')}
                        className="glass-button inline-flex items-center gap-2"
                    >
                        <ArrowLeft size={18} />
                        Zurück zur Liste
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="pb-24 pt-8 px-4 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => router.push('/invoices')}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                    <ArrowLeft size={24} />
                </button>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold text-primary mb-1">
                        Rechnung {invoice.number}
                    </h1>
                    <span className={`text-xs px-3 py-1 rounded-full ${getStatusColor(invoice.status)}`}>
                        {getStatusLabel(invoice.status)}
                    </span>
                </div>
            </div>

            {/* Invoice Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Client Info */}
                <div className="glass-card">
                    <div className="flex items-center gap-2 mb-4">
                        <User size={20} className="text-primary" />
                        <h2 className="text-lg font-bold">Kunde</h2>
                    </div>
                    <div className="space-y-2">
                        <p className="font-medium">{client.name}</p>
                        {client.email && <p className="text-sm text-muted-foreground">{client.email}</p>}
                        {client.phone && <p className="text-sm text-muted-foreground">{client.phone}</p>}
                        {client.address && <p className="text-sm text-muted-foreground">{client.address}</p>}
                    </div>
                </div>

                {/* Invoice Details */}
                <div className="glass-card">
                    <div className="flex items-center gap-2 mb-4">
                        <Calendar size={20} className="text-primary" />
                        <h2 className="text-lg font-bold">Details</h2>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Rechnungsdatum:</span>
                            <span className="text-sm font-medium">
                                {new Date(invoice.date).toLocaleDateString('de-DE')}
                            </span>
                        </div>
                        {invoice.dueDate && (
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Fälligkeitsdatum:</span>
                                <span className="text-sm font-medium">
                                    {new Date(invoice.dueDate).toLocaleDateString('de-DE')}
                                </span>
                            </div>
                        )}
                        <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Erstellt am:</span>
                            <span className="text-sm font-medium">
                                {new Date(invoice.createdAt).toLocaleDateString('de-DE')}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Items */}
            <div className="glass-card mb-6">
                <h2 className="text-lg font-bold mb-4">Positionen</h2>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="text-left py-2 px-2">Beschreibung</th>
                                <th className="text-right py-2 px-2">Menge</th>
                                <th className="text-right py-2 px-2">Preis</th>
                                <th className="text-right py-2 px-2">Gesamt</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoice.items.map((item, index) => (
                                <tr key={index} className="border-b border-gray-100">
                                    <td className="py-3 px-2">
                                        <div>
                                            <p className="font-medium">{item.description}</p>
                                            {item.category && (
                                                <p className="text-xs text-muted-foreground">{item.category}</p>
                                            )}
                                        </div>
                                    </td>
                                    <td className="text-right py-3 px-2">
                                        {item.quantity} {item.unit}
                                    </td>
                                    <td className="text-right py-3 px-2">
                                        €{item.price.toFixed(2)}
                                    </td>
                                    <td className="text-right py-3 px-2 font-medium">
                                        €{(item.price * item.quantity).toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Summary */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex justify-end">
                        <div className="w-full md:w-1/2 space-y-2">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Zwischensumme:</span>
                                <span className="font-medium">€{invoice.subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                                <span>MwSt. (19%):</span>
                                <span>€{invoice.tax.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-xl font-bold pt-2 border-t border-gray-300">
                                <span>Gesamt:</span>
                                <span>€{invoice.total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
                <button
                    onClick={previewPDF}
                    className="flex-1 glass-button flex items-center justify-center gap-2"
                >
                    <FileText size={18} />
                    PDF Vorschau
                </button>
                <button
                    onClick={downloadPDF}
                    className="flex-1 glass-button flex items-center justify-center gap-2"
                >
                    <Download size={18} />
                    PDF herunterladen
                </button>
                <button
                    onClick={deleteInvoice}
                    className="glass-button flex items-center justify-center gap-2 text-red-600 hover:bg-red-50"
                >
                    <Trash2 size={18} />
                    Löschen
                </button>
            </div>
        </div>
    );
}
