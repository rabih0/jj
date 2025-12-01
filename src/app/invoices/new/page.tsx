'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, getNextInvoiceNumber, initializeSeedData, type Client, type InvoiceItem } from '@/lib/db';
import { Plus, Trash2, Save, FileText, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function NewInvoicePage() {
    const router = useRouter();
    const [invoiceNumber, setInvoiceNumber] = useState('');
    const [selectedClientId, setSelectedClientId] = useState('');
    const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
    const [dueDate, setDueDate] = useState(
        new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    );
    const [items, setItems] = useState<InvoiceItem[]>([]);
    const [showItemSelector, setShowItemSelector] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    const clients = useLiveQuery(() => db.clients.toArray());
    const priceList = useLiveQuery(() => db.priceList.toArray());

    useEffect(() => {
        initializeSeedData();
        getNextInvoiceNumber().then(setInvoiceNumber);
    }, []);

    const categories = priceList
        ? ['all', ...Array.from(new Set(priceList.map(item => item.category)))]
        : ['all'];

    const filteredPriceList = priceList?.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const addItem = (priceItem: any, includeAssembly = false, includeDisassembly = false) => {
        const newItem: InvoiceItem = {
            id: crypto.randomUUID(),
            description: priceItem.name,
            quantity: 1,
            price: priceItem.basePrice,
            unit: priceItem.unit === 'item' ? 'Stück' : priceItem.unit === 'hour' ? 'Std' : priceItem.unit,
            category: priceItem.category
        };

        const newItems = [newItem];

        if (includeAssembly && priceItem.assemblyPrice) {
            newItems.push({
                id: crypto.randomUUID(),
                description: `Montage: ${priceItem.name}`,
                quantity: 1,
                price: priceItem.assemblyPrice,
                unit: 'Stück',
                category: 'Dienstleistungen'
            });
        }

        if (includeDisassembly && priceItem.disassemblyPrice) {
            newItems.push({
                id: crypto.randomUUID(),
                description: `Demontage: ${priceItem.name}`,
                quantity: 1,
                price: priceItem.disassemblyPrice,
                unit: 'Stück',
                category: 'Dienstleistungen'
            });
        }

        setItems([...items, ...newItems]);
        setShowItemSelector(false);
    };

    const removeItem = (id: string) => {
        setItems(items.filter(item => item.id !== id));
    };

    const updateItemQuantity = (id: string, quantity: number) => {
        setItems(items.map(item => item.id === id ? { ...item, quantity } : item));
    };

    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.19; // 19% VAT
    const total = subtotal + tax;

    const saveInvoice = async (status: 'draft' | 'sent') => {
        if (!selectedClientId) {
            alert('Bitte wählen Sie einen Kunden aus');
            return;
        }

        if (items.length === 0) {
            alert('Bitte fügen Sie mindestens einen Artikel hinzu');
            return;
        }

        const invoice = {
            id: crypto.randomUUID(),
            clientId: selectedClientId,
            number: invoiceNumber,
            date: new Date(invoiceDate),
            dueDate: new Date(dueDate),
            items,
            subtotal,
            tax,
            total,
            status,
            createdAt: new Date()
        };

        await db.invoices.add(invoice);
        router.push('/invoices');
    };

    return (
        <div className="pb-24 pt-8 px-4 max-w-2xl mx-auto">
            <header className="mb-6">
                <h1 className="text-3xl font-bold text-primary mb-2">Neue Rechnung</h1>
                <p className="text-muted-foreground">Rechnung Nr. {invoiceNumber}</p>
            </header>

            {/* Client Selection */}
            <section className="glass-card mb-6">
                <h2 className="text-lg font-semibold mb-4">Kunde</h2>
                <select
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                    className="glass-input w-full"
                >
                    <option value="">Kunde auswählen...</option>
                    {clients?.map(client => (
                        <option key={client.id} value={client.id}>
                            {client.name} - {client.email}
                        </option>
                    ))}
                </select>
                {selectedClientId && clients && (
                    <div className="mt-4 p-3 bg-white/30 dark:bg-black/20 rounded-lg">
                        {(() => {
                            const client = clients.find(c => c.id === selectedClientId);
                            return client ? (
                                <>
                                    <p className="font-medium">{client.name}</p>
                                    <p className="text-sm text-muted-foreground">{client.email}</p>
                                    <p className="text-sm text-muted-foreground">{client.phone}</p>
                                    <p className="text-sm text-muted-foreground">{client.address}</p>
                                </>
                            ) : null;
                        })()}
                    </div>
                )}
            </section>

            {/* Invoice Details */}
            <section className="glass-card mb-6">
                <h2 className="text-lg font-semibold mb-4">Rechnungsdetails</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Rechnungsdatum</label>
                        <input
                            type="date"
                            value={invoiceDate}
                            onChange={(e) => setInvoiceDate(e.target.value)}
                            className="glass-input w-full"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Fälligkeitsdatum</label>
                        <input
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="glass-input w-full"
                        />
                    </div>
                </div>
            </section>

            {/* Items */}
            <section className="glass-card mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Positionen</h2>
                    <button
                        onClick={() => setShowItemSelector(true)}
                        className="glass-button flex items-center gap-2"
                    >
                        <Plus size={18} />
                        Position hinzufügen
                    </button>
                </div>

                {items.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                        Keine Positionen hinzugefügt
                    </p>
                ) : (
                    <div className="space-y-3">
                        {items.map((item) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="flex items-center gap-3 p-3 bg-white/30 dark:bg-black/20 rounded-lg"
                            >
                                <div className="flex-1">
                                    <p className="font-medium">{item.description}</p>
                                    <p className="text-sm text-muted-foreground">{item.category}</p>
                                </div>
                                <input
                                    type="number"
                                    min="1"
                                    value={item.quantity}
                                    onChange={(e) => updateItemQuantity(item.id, parseInt(e.target.value) || 1)}
                                    className="glass-input w-20 text-center"
                                />
                                <span className="text-sm text-muted-foreground w-12">{item.unit}</span>
                                <span className="font-medium w-20 text-right">
                                    €{(item.price * item.quantity).toFixed(2)}
                                </span>
                                <button
                                    onClick={() => removeItem(item.id)}
                                    className="text-red-500 hover:text-red-700 p-2"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </motion.div>
                        ))}
                    </div>
                )}
            </section>

            {/* Summary */}
            {items.length > 0 && (
                <section className="glass-card mb-6">
                    <h2 className="text-lg font-semibold mb-4">Zusammenfassung</h2>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span>Zwischensumme:</span>
                            <span className="font-medium">€{subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                            <span>MwSt. (19%):</span>
                            <span>€{tax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-xl font-bold pt-2 border-t border-gray-300">
                            <span>Gesamt:</span>
                            <span>€{total.toFixed(2)}</span>
                        </div>
                    </div>
                </section>
            )}

            {/* Actions */}
            <div className="flex gap-3">
                <button
                    onClick={() => saveInvoice('draft')}
                    className="flex-1 glass-button flex items-center justify-center gap-2"
                >
                    <Save size={18} />
                    Als Entwurf speichern
                </button>
                <button
                    onClick={() => saveInvoice('sent')}
                    className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:opacity-90 flex items-center justify-center gap-2"
                >
                    <FileText size={18} />
                    Speichern & Senden
                </button>
            </div>

            {/* Item Selector Modal */}
            <AnimatePresence>
                {showItemSelector && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
                        onClick={() => setShowItemSelector(false)}
                    >
                        <motion.div
                            initial={{ y: 100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 100, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="glass-card w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold">Position auswählen</h3>
                                <button
                                    onClick={() => setShowItemSelector(false)}
                                    className="p-2 hover:bg-white/20 rounded-lg"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Search and Filter */}
                            <div className="mb-4 space-y-3">
                                <input
                                    type="text"
                                    placeholder="Suchen..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="glass-input w-full"
                                />
                                <div className="flex gap-2 overflow-x-auto pb-2">
                                    {categories.map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => setSelectedCategory(cat)}
                                            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${selectedCategory === cat
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'glass hover:bg-white/30'
                                                }`}
                                        >
                                            {cat === 'all' ? 'Alle' : cat}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Items List */}
                            <div className="flex-1 overflow-y-auto space-y-2">
                                {filteredPriceList?.map(item => (
                                    <div key={item.id} className="glass p-4 rounded-lg">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <p className="font-medium">{item.name}</p>
                                                <p className="text-sm text-muted-foreground">{item.category}</p>
                                            </div>
                                            <p className="font-bold text-lg">€{item.basePrice}</p>
                                        </div>

                                        <div className="flex gap-2 mt-3">
                                            <button
                                                onClick={() => addItem(item)}
                                                className="flex-1 glass-button text-sm py-2"
                                            >
                                                Hinzufügen
                                            </button>
                                            {item.assemblyPrice && (
                                                <button
                                                    onClick={() => addItem(item, true, false)}
                                                    className="flex-1 glass-button text-sm py-2"
                                                >
                                                    + Montage (€{item.assemblyPrice})
                                                </button>
                                            )}
                                            {item.disassemblyPrice && (
                                                <button
                                                    onClick={() => addItem(item, false, true)}
                                                    className="flex-1 glass-button text-sm py-2"
                                                >
                                                    + Demontage (€{item.disassemblyPrice})
                                                </button>
                                            )}
                                            {item.assemblyPrice && item.disassemblyPrice && (
                                                <button
                                                    onClick={() => addItem(item, true, true)}
                                                    className="flex-1 glass-button text-sm py-2"
                                                >
                                                    + Beides
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
