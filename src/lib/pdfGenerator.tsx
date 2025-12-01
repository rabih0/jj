import { pdf } from '@react-pdf/renderer';
import { InvoicePDF } from '@/components/pdf/InvoicePDF';
import type { Invoice, Client } from '@/lib/db';

export async function generateInvoicePDF(invoice: Invoice, client: Client) {
    const blob = await pdf(
        <InvoicePDF invoice={invoice} client={client} />
    ).toBlob();
    return blob;
}

export function downloadPDF(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

export function previewPDF(blob: Blob) {
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    // Note: URL will be revoked when the window is closed
    setTimeout(() => URL.revokeObjectURL(url), 100);
}

export async function generateAndDownloadInvoicePDF(invoice: Invoice, client: Client) {
    const blob = await generateInvoicePDF(invoice, client);
    const filename = `${invoice.number}_${client.name.replace(/\s+/g, '_')}.pdf`;
    downloadPDF(blob, filename);
}

export async function generateAndPreviewInvoicePDF(invoice: Invoice, client: Client) {
    const blob = await generateInvoicePDF(invoice, client);
    previewPDF(blob);
}
