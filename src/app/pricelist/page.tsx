'use client';

import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, initializeSeedData, type PriceItem } from '@/lib/db';
import { Plus, Search, Edit, Trash2, X, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = ['Wohnzimmer', 'Schlafzimmer', 'Küche/Esszimmer', 'Verpackung', 'Dienstleistungen'];
const UNITS = [
    { value: 'item', label: 'Stück' },
    { value: 'hour', label: 'Stunde' },
    { value: 'm3', label: 'm³' },
    { value: 'km', label: 'km' }
];
const SIZES = ['M', 'L', 'XL', 'XXL'] as const;

export default function PriceListPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<PriceItem | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        category: CATEGORIES[0],
        basePrice: 0,
        unit: 'item' as 'item' | 'hour' | 'm3' | 'km',
        volume: 0,
        assemblyPrice: 0,
        disassemblyPrice: 0,
        hasSizes: false,
        sizes: SIZES.map(size => ({ size, price: 0, volume: 0 }))
    });

    const priceList = useLiveQuery(() => db.priceList.toArray());

    useEffect(() => {
        initializeSeedData();
    }, []);

    const filteredItems = priceList?.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const openModal = (item?: PriceItem) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                name: item.name,
                category: item.category,
                basePrice: item.basePrice,
                unit: item.unit,
                volume: item.volume || 0,
                assemblyPrice: item.assemblyPrice || 0,
                disassemblyPrice: item.disassemblyPrice || 0,
                hasSizes: item.hasSizes || false,
                sizes: item.hasSizes && item.sizes ? item.sizes.map(s => ({
                    size: s.size,
                    price: s.price,
                    volume: s.volume || 0
                })) : SIZES.map(size => ({ size, price: 0, volume: 0 }))
            });
        } else {
            setEditingItem(null);
            setFormData({
                name: '',
                category: CATEGORIES[0],
                basePrice: 0,
                unit: 'item',
                volume: 0,
                assemblyPrice: 0,
                disassemblyPrice: 0,
                hasSizes: false,
                sizes: SIZES.map(size => ({ size, price: 0, volume: 0 }))
            });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingItem(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            alert('Bitte geben Sie einen Namen ein');
            return;
        }

        const itemData: Partial<PriceItem> = {
            name: formData.name,
            category: formData.category,
            basePrice: formData.basePrice,
            unit: formData.unit,
            volume: formData.volume || undefined,
            assemblyPrice: formData.assemblyPrice || undefined,
            disassemblyPrice: formData.disassemblyPrice || undefined,
            hasSizes: formData.hasSizes,
            sizes: formData.hasSizes ? formData.sizes : undefined
        };

        if (editingItem) {
            await db.priceList.update(editingItem.id, itemData);
        } else {
            await db.priceList.add({
                ...itemData,
                id: crypto.randomUUID()
            } as PriceItem);
        }

        closeModal();
    };

    const deleteItem = async (id: string) => {
        if (confirm('Möchten Sie diesen Artikel wirklich löschen?')) {
            await db.priceList.delete(id);
        }
    };

    return (
        <div className="pb-24 pt-8 px-4 max-w-6xl mx-auto">
            <header className="mb-6">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-primary mb-1">Preisliste</h1>
                        <p className="text-muted-foreground">
                            {filteredItems?.length || 0} Artikel
                        </p>
                    </div>
                    <button
                        onClick={() => openModal()}
                        className="glass-button flex items-center gap-2"
                    >
                        <Plus size={18} />
                        Neuer Artikel
                    </button>
                </div>

                {/* Search and Filter */}
                <div className="glass-card">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                            <input
                                type="text"
                                placeholder="Artikel suchen..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="glass-input w-full pl-10"
                            />
                        </div>
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="glass-input sm:w-48"
                        >
                            <option value="all">Alle Kategorien</option>
                            {CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </header>

            {/* Items List */}
            {!filteredItems || filteredItems.length === 0 ? (
                <div className="glass-card text-center py-12">
                    <Package size={48} className="mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">Keine Artikel gefunden</h3>
                    <p className="text-muted-foreground mb-6">
                        {searchTerm || categoryFilter !== 'all'
                            ? 'Versuchen Sie, Ihre Suchkriterien anzupassen'
                            : 'Fügen Sie Ihren ersten Artikel hinzu'}
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredItems.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.02 }}
                            className="glass-card hover:shadow-lg transition-shadow"
                        >
                            <div className="flex flex-col md:flex-row md:items-center gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-bold">{item.name}</h3>
                                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800">
                                            {item.category}
                                        </span>
                                        {item.hasSizes && (
                                            <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                                                Größen
                                            </span>
                                        )}
                                    </div>

                                    {item.hasSizes && item.sizes ? (
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
                                            {item.sizes.map(sizeItem => (
                                                <div key={sizeItem.size} className="text-sm bg-white/30 dark:bg-black/20 p-2 rounded">
                                                    <span className="font-medium">{sizeItem.size}:</span> €{sizeItem.price.toFixed(2)}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-2xl font-bold text-primary mb-2">
                                            €{item.basePrice.toFixed(2)}
                                        </p>
                                    )}

                                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                        <span>Einheit: {UNITS.find(u => u.value === item.unit)?.label}</span>
                                        {item.volume && <span>Volumen: {item.volume} m³</span>}
                                        {item.assemblyPrice && <span>Montage: €{item.assemblyPrice}</span>}
                                        {item.disassemblyPrice && <span>Demontage: €{item.disassemblyPrice}</span>}
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => openModal(item)}
                                        className="glass-button text-sm py-2 px-4 flex items-center gap-2"
                                    >
                                        <Edit size={16} />
                                        Bearbeiten
                                    </button>
                                    <button
                                        onClick={() => deleteItem(item.id)}
                                        className="glass-button text-sm py-2 px-3 text-red-600 hover:bg-red-50"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
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
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
                        onClick={closeModal}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="glass-card w-full max-w-2xl my-8"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold">
                                    {editingItem ? 'Artikel bearbeiten' : 'Neuer Artikel'}
                                </h2>
                                <button
                                    onClick={closeModal}
                                    className="p-2 hover:bg-white/20 rounded-lg"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Name *</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="glass-input w-full"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">Kategorie</label>
                                        <select
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            className="glass-input w-full"
                                        >
                                            {CATEGORIES.map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">Einheit</label>
                                        <select
                                            value={formData.unit}
                                            onChange={(e) => setFormData({ ...formData, unit: e.target.value as any })}
                                            className="glass-input w-full"
                                        >
                                            {UNITS.map(unit => (
                                                <option key={unit.value} value={unit.value}>{unit.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">Volumen (m³)</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={formData.volume}
                                            onChange={(e) => setFormData({ ...formData, volume: parseFloat(e.target.value) || 0 })}
                                            className="glass-input w-full"
                                        />
                                    </div>
                                </div>

                                {/* Sizes Toggle */}
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="hasSizes"
                                        checked={formData.hasSizes}
                                        onChange={(e) => setFormData({ ...formData, hasSizes: e.target.checked })}
                                        className="w-4 h-4"
                                    />
                                    <label htmlFor="hasSizes" className="text-sm font-medium">
                                        Verschiedene Größen (M, L, XL, XXL)
                                    </label>
                                </div>

                                {formData.hasSizes ? (
                                    <div className="space-y-3">
                                        <h3 className="font-medium">Preise nach Größe</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {SIZES.map((size, idx) => (
                                                <div key={size} className="glass p-3 rounded-lg">
                                                    <label className="block text-sm font-medium mb-2">
                                                        Größe {size}
                                                    </label>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div>
                                                            <label className="block text-xs text-muted-foreground mb-1">Preis (€)</label>
                                                            <input
                                                                type="number"
                                                                step="0.01"
                                                                value={formData.sizes[idx].price}
                                                                onChange={(e) => {
                                                                    const newSizes = [...formData.sizes];
                                                                    newSizes[idx].price = parseFloat(e.target.value) || 0;
                                                                    setFormData({ ...formData, sizes: newSizes });
                                                                }}
                                                                className="glass-input w-full"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs text-muted-foreground mb-1">Volumen (m³)</label>
                                                            <input
                                                                type="number"
                                                                step="0.1"
                                                                value={formData.sizes[idx].volume || 0}
                                                                onChange={(e) => {
                                                                    const newSizes = [...formData.sizes];
                                                                    newSizes[idx].volume = parseFloat(e.target.value) || 0;
                                                                    setFormData({ ...formData, sizes: newSizes });
                                                                }}
                                                                className="glass-input w-full"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Basispreis (€)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={formData.basePrice}
                                            onChange={(e) => setFormData({ ...formData, basePrice: parseFloat(e.target.value) || 0 })}
                                            className="glass-input w-full"
                                        />
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Montagepreis (€)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={formData.assemblyPrice}
                                            onChange={(e) => setFormData({ ...formData, assemblyPrice: parseFloat(e.target.value) || 0 })}
                                            className="glass-input w-full"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">Demontagepreis (€)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={formData.disassemblyPrice}
                                            onChange={(e) => setFormData({ ...formData, disassemblyPrice: parseFloat(e.target.value) || 0 })}
                                            className="glass-input w-full"
                                        />
                                    </div>
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
                                        {editingItem ? 'Aktualisieren' : 'Erstellen'}
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
