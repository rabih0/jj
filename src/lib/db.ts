import Dexie, { type EntityTable } from 'dexie';

// Define interfaces for our data models
export interface Client {
    id: string; // UUID
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    createdAt: Date;
}

export interface InvoiceItem {
    id: string;
    description: string;
    quantity: number;
    price: number;
    unit?: string;
    category?: string;
}

export interface Invoice {
    id: string; // UUID
    clientId: string;
    number: string; // e.g., INV-001
    date: Date;
    dueDate?: Date;
    items: InvoiceItem[];
    subtotal: number;
    tax: number;
    total: number;
    status: 'draft' | 'sent' | 'paid' | 'overdue';
    createdAt: Date;
}

export interface PriceItem {
    id: string; // UUID
    name: string;
    category: string;
    basePrice: number;
    unit: 'item' | 'hour' | 'm3' | 'km';
    volume?: number; // m3
    assemblyPrice?: number;
    disassemblyPrice?: number;
    hasSizes?: boolean; // Whether this item has size variants
    sizes?: {
        size: 'M' | 'L' | 'XL' | 'XXL';
        price: number;
        volume?: number;
    }[];
}


export interface Setting {
    key: string;
    value: any;
}

// Database declaration
const db = new Dexie('MovingAppDB') as Dexie & {
    clients: EntityTable<Client, 'id'>;
    invoices: EntityTable<Invoice, 'id'>;
    priceList: EntityTable<PriceItem, 'id'>;
    settings: EntityTable<Setting, 'key'>;
};

// Schema definition
db.version(1).stores({
    clients: 'id, name, email',
    invoices: 'id, clientId, number, date, status',
    priceList: 'id, name, category',
    settings: 'key'
});

// Helper functions
export async function getNextInvoiceNumber(): Promise<string> {
    const invoices = await db.invoices.orderBy('number').reverse().limit(1).toArray();
    if (invoices.length === 0) {
        return 'INV-001';
    }
    const lastNumber = invoices[0].number;
    const numberPart = parseInt(lastNumber.split('-')[1]);
    return `INV-${String(numberPart + 1).padStart(3, '0')}`;
}

export async function getInvoiceWithClient(invoiceId: string) {
    const invoice = await db.invoices.get(invoiceId);
    if (!invoice) return null;

    const client = await db.clients.get(invoice.clientId);
    return { invoice, client };
}

// Seed data initialization
export async function initializeSeedData() {
    // Check if data already exists
    const clientCount = await db.clients.count();
    if (clientCount > 0) return; // Data already seeded

    // Add sample clients
    const clients: Client[] = [
        {
            id: crypto.randomUUID(),
            name: 'Max Mustermann',
            email: 'max@example.com',
            phone: '+49 30 12345678',
            address: 'Hauptstraße 1, 10115 Berlin',
            createdAt: new Date()
        },
        {
            id: crypto.randomUUID(),
            name: 'Anna Schmidt',
            email: 'anna.schmidt@example.com',
            phone: '+49 40 98765432',
            address: 'Musterweg 15, 20095 Hamburg',
            createdAt: new Date()
        },
        {
            id: crypto.randomUUID(),
            name: 'Thomas Müller',
            email: 'thomas.mueller@example.com',
            phone: '+49 89 55544433',
            address: 'Beispielstraße 42, 80331 München',
            createdAt: new Date()
        }
    ];

    await db.clients.bulkAdd(clients);

    // Add sample price list items
    const priceItems: PriceItem[] = [
        // Furniture - Living Room
        { id: crypto.randomUUID(), name: 'Sofa (3-Sitzer)', category: 'Wohnzimmer', basePrice: 150, unit: 'item', volume: 2.5, assemblyPrice: 50, disassemblyPrice: 40 },
        { id: crypto.randomUUID(), name: 'Sessel', category: 'Wohnzimmer', basePrice: 80, unit: 'item', volume: 1.2, assemblyPrice: 30, disassemblyPrice: 25 },
        { id: crypto.randomUUID(), name: 'Couchtisch', category: 'Wohnzimmer', basePrice: 60, unit: 'item', volume: 0.8, assemblyPrice: 20, disassemblyPrice: 15 },
        { id: crypto.randomUUID(), name: 'TV-Schrank', category: 'Wohnzimmer', basePrice: 100, unit: 'item', volume: 1.5, assemblyPrice: 40, disassemblyPrice: 35 },
        { id: crypto.randomUUID(), name: 'Regal', category: 'Wohnzimmer', basePrice: 70, unit: 'item', volume: 1.0, assemblyPrice: 35, disassemblyPrice: 30 },

        // Furniture - Bedroom
        { id: crypto.randomUUID(), name: 'Bett (140x200)', category: 'Schlafzimmer', basePrice: 120, unit: 'item', volume: 2.0, assemblyPrice: 60, disassemblyPrice: 50 },
        { id: crypto.randomUUID(), name: 'Bett (180x200)', category: 'Schlafzimmer', basePrice: 150, unit: 'item', volume: 2.5, assemblyPrice: 80, disassemblyPrice: 70 },
        { id: crypto.randomUUID(), name: 'Kleiderschrank (2-türig)', category: 'Schlafzimmer', basePrice: 140, unit: 'item', volume: 2.2, assemblyPrice: 70, disassemblyPrice: 60 },
        { id: crypto.randomUUID(), name: 'Kleiderschrank (3-türig)', category: 'Schlafzimmer', basePrice: 180, unit: 'item', volume: 3.0, assemblyPrice: 90, disassemblyPrice: 80 },
        { id: crypto.randomUUID(), name: 'Nachttisch', category: 'Schlafzimmer', basePrice: 40, unit: 'item', volume: 0.5, assemblyPrice: 15, disassemblyPrice: 10 },

        // Furniture - Kitchen & Dining
        { id: crypto.randomUUID(), name: 'Esstisch', category: 'Küche/Esszimmer', basePrice: 90, unit: 'item', volume: 1.3, assemblyPrice: 40, disassemblyPrice: 30 },
        { id: crypto.randomUUID(), name: 'Stuhl', category: 'Küche/Esszimmer', basePrice: 25, unit: 'item', volume: 0.3, assemblyPrice: 10, disassemblyPrice: 5 },
        { id: crypto.randomUUID(), name: 'Küchenschrank', category: 'Küche/Esszimmer', basePrice: 100, unit: 'item', volume: 1.5, assemblyPrice: 50, disassemblyPrice: 40 },

        // Boxes & Materials
        { id: crypto.randomUUID(), name: 'Umzugskarton Standard', category: 'Verpackung', basePrice: 3, unit: 'item', volume: 0.1 },
        { id: crypto.randomUUID(), name: 'Umzugskarton Groß', category: 'Verpackung', basePrice: 4, unit: 'item', volume: 0.15 },
        { id: crypto.randomUUID(), name: 'Kleiderbox', category: 'Verpackung', basePrice: 8, unit: 'item', volume: 0.2 },
        { id: crypto.randomUUID(), name: 'Luftpolsterfolie (Rolle)', category: 'Verpackung', basePrice: 12, unit: 'item', volume: 0.05 },
        { id: crypto.randomUUID(), name: 'Packpapier (10kg)', category: 'Verpackung', basePrice: 15, unit: 'item', volume: 0.08 },

        // Services
        { id: crypto.randomUUID(), name: 'Arbeitsstunde', category: 'Dienstleistungen', basePrice: 35, unit: 'hour' },
        { id: crypto.randomUUID(), name: 'LKW-Miete', category: 'Dienstleistungen', basePrice: 50, unit: 'hour' },
        { id: crypto.randomUUID(), name: 'Kilometer-Pauschale', category: 'Dienstleistungen', basePrice: 0.5, unit: 'km' },
    ];

    await db.priceList.bulkAdd(priceItems);

    // Add sample invoices
    const sampleInvoice: Invoice = {
        id: crypto.randomUUID(),
        clientId: clients[0].id,
        number: 'INV-001',
        date: new Date(),
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        items: [
            { id: crypto.randomUUID(), description: 'Sofa (3-Sitzer)', quantity: 1, price: 150, unit: 'Stück', category: 'Wohnzimmer' },
            { id: crypto.randomUUID(), description: 'Montage', quantity: 1, price: 50, unit: 'Stück', category: 'Dienstleistungen' },
            { id: crypto.randomUUID(), description: 'Umzugskarton Standard', quantity: 10, price: 3, unit: 'Stück', category: 'Verpackung' }
        ],
        subtotal: 230,
        tax: 43.70,
        total: 273.70,
        status: 'sent',
        createdAt: new Date()
    };

    await db.invoices.add(sampleInvoice);

    console.log('✅ Seed data initialized successfully');
}

export { db };

