'use client';

import { useState, useEffect } from 'react';
import { db, initializeSeedData } from '@/lib/db';
import { Building2, FileText, CreditCard, Save } from 'lucide-react';

export default function SettingsPage() {
    const [companyInfo, setCompanyInfo] = useState({
        name: 'UmzugsManager GmbH',
        address: 'Musterstraße 123, 12345 Berlin',
        phone: '+49 30 12345678',
        email: 'info@umzugsmanager.de',
        taxId: 'DE123456789',
        website: 'www.umzugsmanager.de'
    });

    const [bankDetails, setBankDetails] = useState({
        bankName: 'Commerzbank',
        iban: 'DE89 3704 0044 0532 0130 00',
        bic: 'COBADEFFXXX',
        accountHolder: 'UmzugsManager GmbH'
    });

    const [invoiceSettings, setInvoiceSettings] = useState({
        invoicePrefix: 'INV',
        nextNumber: 1,
        taxRate: 19,
        paymentTerms: 14,
        currency: 'EUR'
    });

    const [saved, setSaved] = useState(false);

    useEffect(() => {
        initializeSeedData();
        loadSettings();
    }, []);

    const loadSettings = async () => {
        const settings = await db.settings.toArray();
        settings.forEach(setting => {
            if (setting.key === 'companyInfo') {
                setCompanyInfo(setting.value);
            } else if (setting.key === 'bankDetails') {
                setBankDetails(setting.value);
            } else if (setting.key === 'invoiceSettings') {
                setInvoiceSettings(setting.value);
            }
        });
    };

    const saveSettings = async () => {
        await db.settings.put({ key: 'companyInfo', value: companyInfo });
        await db.settings.put({ key: 'bankDetails', value: bankDetails });
        await db.settings.put({ key: 'invoiceSettings', value: invoiceSettings });

        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <div className="pb-24 pt-8 px-4 max-w-4xl mx-auto">
            <header className="mb-6">
                <h1 className="text-3xl font-bold text-primary mb-1">Einstellungen</h1>
                <p className="text-muted-foreground">
                    Konfigurieren Sie Ihre Unternehmens- und Rechnungseinstellungen
                </p>
            </header>

            {/* Company Information */}
            <section className="glass-card mb-6">
                <div className="flex items-center gap-3 mb-4">
                    <Building2 size={24} className="text-primary" />
                    <h2 className="text-xl font-bold">Unternehmensinformationen</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Firmenname</label>
                        <input
                            type="text"
                            value={companyInfo.name}
                            onChange={(e) => setCompanyInfo({ ...companyInfo, name: e.target.value })}
                            className="glass-input w-full"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">E-Mail</label>
                        <input
                            type="email"
                            value={companyInfo.email}
                            onChange={(e) => setCompanyInfo({ ...companyInfo, email: e.target.value })}
                            className="glass-input w-full"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Telefon</label>
                        <input
                            type="tel"
                            value={companyInfo.phone}
                            onChange={(e) => setCompanyInfo({ ...companyInfo, phone: e.target.value })}
                            className="glass-input w-full"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Website</label>
                        <input
                            type="text"
                            value={companyInfo.website}
                            onChange={(e) => setCompanyInfo({ ...companyInfo, website: e.target.value })}
                            className="glass-input w-full"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-2">Adresse</label>
                        <input
                            type="text"
                            value={companyInfo.address}
                            onChange={(e) => setCompanyInfo({ ...companyInfo, address: e.target.value })}
                            className="glass-input w-full"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Steuernummer / USt-IdNr</label>
                        <input
                            type="text"
                            value={companyInfo.taxId}
                            onChange={(e) => setCompanyInfo({ ...companyInfo, taxId: e.target.value })}
                            className="glass-input w-full"
                        />
                    </div>
                </div>
            </section>

            {/* Bank Details */}
            <section className="glass-card mb-6">
                <div className="flex items-center gap-3 mb-4">
                    <CreditCard size={24} className="text-primary" />
                    <h2 className="text-xl font-bold">Bankverbindung</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Kontoinhaber</label>
                        <input
                            type="text"
                            value={bankDetails.accountHolder}
                            onChange={(e) => setBankDetails({ ...bankDetails, accountHolder: e.target.value })}
                            className="glass-input w-full"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Bank</label>
                        <input
                            type="text"
                            value={bankDetails.bankName}
                            onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                            className="glass-input w-full"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">IBAN</label>
                        <input
                            type="text"
                            value={bankDetails.iban}
                            onChange={(e) => setBankDetails({ ...bankDetails, iban: e.target.value })}
                            className="glass-input w-full"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">BIC</label>
                        <input
                            type="text"
                            value={bankDetails.bic}
                            onChange={(e) => setBankDetails({ ...bankDetails, bic: e.target.value })}
                            className="glass-input w-full"
                        />
                    </div>
                </div>
            </section>

            {/* Invoice Settings */}
            <section className="glass-card mb-6">
                <div className="flex items-center gap-3 mb-4">
                    <FileText size={24} className="text-primary" />
                    <h2 className="text-xl font-bold">Rechnungseinstellungen</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Rechnungspräfix</label>
                        <input
                            type="text"
                            value={invoiceSettings.invoicePrefix}
                            onChange={(e) => setInvoiceSettings({ ...invoiceSettings, invoicePrefix: e.target.value })}
                            className="glass-input w-full"
                            placeholder="INV"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Nächste Rechnungsnummer</label>
                        <input
                            type="number"
                            value={invoiceSettings.nextNumber}
                            onChange={(e) => setInvoiceSettings({ ...invoiceSettings, nextNumber: parseInt(e.target.value) || 1 })}
                            className="glass-input w-full"
                            min="1"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Steuersatz (%)</label>
                        <input
                            type="number"
                            value={invoiceSettings.taxRate}
                            onChange={(e) => setInvoiceSettings({ ...invoiceSettings, taxRate: parseInt(e.target.value) || 19 })}
                            className="glass-input w-full"
                            min="0"
                            max="100"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Zahlungsziel (Tage)</label>
                        <input
                            type="number"
                            value={invoiceSettings.paymentTerms}
                            onChange={(e) => setInvoiceSettings({ ...invoiceSettings, paymentTerms: parseInt(e.target.value) || 14 })}
                            className="glass-input w-full"
                            min="1"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Währung</label>
                        <select
                            value={invoiceSettings.currency}
                            onChange={(e) => setInvoiceSettings({ ...invoiceSettings, currency: e.target.value })}
                            className="glass-input w-full"
                        >
                            <option value="EUR">EUR (€)</option>
                            <option value="USD">USD ($)</option>
                            <option value="GBP">GBP (£)</option>
                            <option value="CHF">CHF (Fr)</option>
                        </select>
                    </div>
                </div>
            </section>

            {/* Save Button */}
            <div className="flex justify-end gap-3">
                {saved && (
                    <div className="flex items-center gap-2 text-green-600 font-medium">
                        ✓ Einstellungen gespeichert
                    </div>
                )}
                <button
                    onClick={saveSettings}
                    className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:opacity-90 flex items-center gap-2"
                >
                    <Save size={18} />
                    Einstellungen speichern
                </button>
            </div>
        </div>
    );
}
