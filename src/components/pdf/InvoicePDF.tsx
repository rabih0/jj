import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import type { Invoice, Client } from '@/lib/db';

// Define styles for PDF
const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontSize: 11,
        fontFamily: 'Helvetica',
    },
    header: {
        marginBottom: 30,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    companyInfo: {
        fontSize: 10,
        color: '#666',
        marginBottom: 20,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    clientBox: {
        padding: 15,
        backgroundColor: '#f5f5f5',
        borderRadius: 5,
        marginBottom: 20,
    },
    table: {
        marginTop: 20,
        marginBottom: 20,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#374151',
        color: 'white',
        padding: 10,
        fontWeight: 'bold',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        padding: 10,
    },
    tableCol1: { width: '50%' },
    tableCol2: { width: '15%', textAlign: 'right' },
    tableCol3: { width: '15%', textAlign: 'right' },
    tableCol4: { width: '20%', textAlign: 'right' },
    summary: {
        marginTop: 20,
        marginLeft: 'auto',
        width: '40%',
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
        paddingTop: 10,
        borderTopWidth: 2,
        borderTopColor: '#374151',
        fontSize: 14,
        fontWeight: 'bold',
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        fontSize: 9,
        color: '#666',
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        paddingTop: 10,
    },
});

interface InvoicePDFProps {
    invoice: Invoice;
    client: Client;
    companyInfo?: {
        name: string;
        address: string;
        phone: string;
        email: string;
        taxId: string;
        bankDetails: string;
    };
}

export function InvoicePDF({ invoice, client, companyInfo }: InvoicePDFProps) {
    const defaultCompanyInfo = {
        name: 'UmzugsManager GmbH',
        address: 'Musterstraße 123, 12345 Berlin',
        phone: '+49 30 12345678',
        email: 'info@umzugsmanager.de',
        taxId: 'DE123456789',
        bankDetails: 'IBAN: DE89 3704 0044 0532 0130 00 | BIC: COBADEFFXXX',
    };

    const company = companyInfo || defaultCompanyInfo;

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>RECHNUNG</Text>
                    <Text style={styles.companyInfo}>{company.name}</Text>
                    <Text style={styles.companyInfo}>{company.address}</Text>
                    <Text style={styles.companyInfo}>
                        Tel: {company.phone} | Email: {company.email}
                    </Text>
                    <Text style={styles.companyInfo}>USt-IdNr: {company.taxId}</Text>
                </View>

                {/* Client Information */}
                <View style={styles.clientBox}>
                    <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>{client.name}</Text>
                    {client.address && <Text>{client.address}</Text>}
                    {client.email && <Text>{client.email}</Text>}
                    {client.phone && <Text>{client.phone}</Text>}
                </View>

                {/* Invoice Details */}
                <View style={styles.section}>
                    <View style={styles.row}>
                        <Text>Rechnungsnummer:</Text>
                        <Text style={{ fontWeight: 'bold' }}>{invoice.number}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text>Rechnungsdatum:</Text>
                        <Text>{new Date(invoice.date).toLocaleDateString('de-DE')}</Text>
                    </View>
                    {invoice.dueDate && (
                        <View style={styles.row}>
                            <Text>Fälligkeitsdatum:</Text>
                            <Text>{new Date(invoice.dueDate).toLocaleDateString('de-DE')}</Text>
                        </View>
                    )}
                </View>

                {/* Items Table */}
                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <Text style={styles.tableCol1}>Beschreibung</Text>
                        <Text style={styles.tableCol2}>Menge</Text>
                        <Text style={styles.tableCol3}>Preis</Text>
                        <Text style={styles.tableCol4}>Gesamt</Text>
                    </View>
                    {invoice.items.map((item, index) => (
                        <View key={index} style={styles.tableRow}>
                            <Text style={styles.tableCol1}>{item.description}</Text>
                            <Text style={styles.tableCol2}>
                                {item.quantity} {item.unit}
                            </Text>
                            <Text style={styles.tableCol3}>€{item.price.toFixed(2)}</Text>
                            <Text style={styles.tableCol4}>
                                €{(item.price * item.quantity).toFixed(2)}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* Summary */}
                <View style={styles.summary}>
                    <View style={styles.summaryRow}>
                        <Text>Zwischensumme:</Text>
                        <Text>€{invoice.subtotal.toFixed(2)}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text>MwSt. (19%):</Text>
                        <Text>€{invoice.tax.toFixed(2)}</Text>
                    </View>
                    <View style={styles.totalRow}>
                        <Text>Gesamtbetrag:</Text>
                        <Text>€{invoice.total.toFixed(2)}</Text>
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={{ marginBottom: 5 }}>Zahlungsbedingungen: Zahlbar innerhalb von 14 Tagen ohne Abzug.</Text>
                    <Text>{company.bankDetails}</Text>
                    <Text style={{ marginTop: 10, textAlign: 'center' }}>
                        Vielen Dank für Ihr Vertrauen!
                    </Text>
                </View>
            </Page>
        </Document>
    );
}
