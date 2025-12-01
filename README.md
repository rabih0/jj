# 🚚 UmzugsManager - Moving Company Management System

A comprehensive web application for managing moving company operations, including invoices, clients, price lists, and PDF generation.

[العربية](#العربية) | [English](#english)

---

## English

### 🌟 Features

#### 📄 Invoice Management
- **Create & Edit Invoices**: Full invoice creation with smart item selector
- **PDF Generation**: Professional PDF invoices with company branding
- **Status Tracking**: Draft, Sent, Paid, Overdue statuses
- **Search & Filter**: Quick search and status-based filtering
- **Item Management**: Add items with assembly/disassembly options

#### 👥 Client Management
- **CRUD Operations**: Create, Read, Update, Delete clients
- **Contact Information**: Store name, email, phone, and address
- **Search**: Quick client search functionality

#### 💰 Price List Management
- **Dynamic Pricing**: Add and edit service/item prices
- **Size Variants**: Support for M, L, XL, XXL sizes with different prices
- **Categories**: Organize items by category (Living Room, Bedroom, Kitchen, Packing, Services)
- **Assembly/Disassembly**: Separate pricing for assembly and disassembly services

#### ⚙️ Settings
- **Company Information**: Configure company details
- **Bank Details**: IBAN, BIC, account holder information
- **Invoice Settings**: Customize invoice prefix, numbering, tax rate, payment terms

### 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4 with custom Glassmorphism design
- **Database**: Dexie.js (IndexedDB wrapper) for offline-first functionality
- **PDF Generation**: @react-pdf/renderer
- **Animations**: Framer Motion
- **Icons**: Lucide React

### 📦 Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/umzugsmanager.git

# Navigate to project directory
cd umzugsmanager

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 🚀 Build for Production

```bash
# Create production build
npm run build

# Start production server
npm start
```

### 📱 Pages

- **`/`** - Dashboard with statistics and recent activity
- **`/invoices`** - Invoice list with search and filters
- **`/invoices/new`** - Create new invoice
- **`/invoices/[id]`** - View invoice details
- **`/clients`** - Client management
- **`/pricelist`** - Price list management with size variants
- **`/settings`** - Application settings

### 🎨 Design Features

- **Glassmorphism UI**: Modern glass-effect design
- **Responsive**: Works on all devices (mobile, tablet, desktop)
- **Dark Mode Ready**: Prepared for dark mode implementation
- **Smooth Animations**: Framer Motion for fluid transitions
- **Bottom Navigation**: Mobile-friendly navigation bar

### 📊 Database Schema

The application uses IndexedDB with the following tables:

- **clients**: Customer information
- **invoices**: Invoice records with items
- **priceList**: Service and item pricing with size variants
- **settings**: Application configuration

### 🔧 Key Features Implementation

#### Size Variants
Items can have multiple size options (M, L, XL, XXL), each with:
- Individual price
- Individual volume (m³)
- Assembly/disassembly pricing

#### Smart Item Selector
- Search functionality
- Category filtering
- Quick add with assembly/disassembly options
- Real-time price calculation

#### PDF Generation
- Professional invoice layout
- Company branding
- Client information
- Itemized list with totals
- Tax calculation (19% VAT)
- Payment terms and bank details

### 📝 Sample Data

The application includes seed data:
- 3 sample clients
- 22 price list items across 5 categories
- 1 sample invoice

### 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## العربية

### 🌟 المميزات

#### 📄 إدارة الفواتير
- **إنشاء وتعديل الفواتير**: إنشاء فواتير كاملة مع محدد عناصر ذكي
- **توليد PDF**: فواتير PDF احترافية مع علامة الشركة التجارية
- **تتبع الحالة**: حالات المسودة، المرسلة، المدفوعة، المتأخرة
- **البحث والتصفية**: بحث سريع وتصفية حسب الحالة
- **إدارة العناصر**: إضافة عناصر مع خيارات التركيب/الفك

#### 👥 إدارة العملاء
- **عمليات CRUD**: إنشاء، قراءة، تحديث، حذف العملاء
- **معلومات الاتصال**: تخزين الاسم، البريد الإلكتروني، الهاتف، والعنوان
- **البحث**: وظيفة بحث سريع عن العملاء

#### 💰 إدارة قائمة الأسعار
- **تسعير ديناميكي**: إضافة وتعديل أسعار الخدمات/العناصر
- **أحجام متعددة**: دعم الأحجام M, L, XL, XXL بأسعار مختلفة
- **الفئات**: تنظيم العناصر حسب الفئة (غرفة المعيشة، غرفة النوم، المطبخ، التعبئة، الخدمات)
- **التركيب/الفك**: تسعير منفصل لخدمات التركيب والفك

#### ⚙️ الإعدادات
- **معلومات الشركة**: تكوين تفاصيل الشركة
- **البيانات البنكية**: IBAN، BIC، معلومات صاحب الحساب
- **إعدادات الفاتورة**: تخصيص بادئة الفاتورة، الترقيم، معدل الضريبة، شروط الدفع

### 🛠️ التقنيات المستخدمة

- **الإطار**: Next.js 16 (App Router)
- **اللغة**: TypeScript
- **التنسيق**: Tailwind CSS 4 مع تصميم Glassmorphism مخصص
- **قاعدة البيانات**: Dexie.js (IndexedDB) للعمل بدون اتصال
- **توليد PDF**: @react-pdf/renderer
- **الحركات**: Framer Motion
- **الأيقونات**: Lucide React

### 📦 التثبيت

```bash
# استنساخ المستودع
git clone https://github.com/yourusername/umzugsmanager.git

# الانتقال إلى مجلد المشروع
cd umzugsmanager

# تثبيت التبعيات
npm install

# تشغيل خادم التطوير
npm run dev
```

افتح [http://localhost:3000](http://localhost:3000) في المتصفح.

### 🚀 البناء للإنتاج

```bash
# إنشاء نسخة الإنتاج
npm run build

# تشغيل خادم الإنتاج
npm start
```

### 📱 الصفحات

- **`/`** - لوحة التحكم مع الإحصائيات والنشاط الأخير
- **`/invoices`** - قائمة الفواتير مع البحث والتصفية
- **`/invoices/new`** - إنشاء فاتورة جديدة
- **`/invoices/[id]`** - عرض تفاصيل الفاتورة
- **`/clients`** - إدارة العملاء
- **`/pricelist`** - إدارة قائمة الأسعار مع أحجام متعددة
- **`/settings`** - إعدادات التطبيق

### 🎨 مميزات التصميم

- **واجهة Glassmorphism**: تصميم عصري بتأثير زجاجي
- **متجاوب**: يعمل على جميع الأجهزة (موبايل، تابلت، سطح المكتب)
- **جاهز للوضع الداكن**: معد لتطبيق الوضع الداكن
- **حركات سلسة**: Framer Motion للانتقالات السلسة
- **شريط تنقل سفلي**: شريط تنقل ملائم للموبايل

### 📊 مخطط قاعدة البيانات

يستخدم التطبيق IndexedDB مع الجداول التالية:

- **clients**: معلومات العملاء
- **invoices**: سجلات الفواتير مع العناصر
- **priceList**: تسعير الخدمات والعناصر مع أحجام متعددة
- **settings**: إعدادات التطبيق

### 🔧 تنفيذ الميزات الرئيسية

#### الأحجام المتعددة
يمكن أن يكون للعناصر خيارات أحجام متعددة (M, L, XL, XXL)، كل منها مع:
- سعر فردي
- حجم فردي (م³)
- تسعير التركيب/الفك

#### محدد العناصر الذكي
- وظيفة البحث
- تصفية حسب الفئة
- إضافة سريعة مع خيارات التركيب/الفك
- حساب السعر في الوقت الفعلي

#### توليد PDF
- تخطيط فاتورة احترافي
- علامة الشركة التجارية
- معلومات العميل
- قائمة مفصلة بالإجماليات
- حساب الضريبة (19% ضريبة القيمة المضافة)
- شروط الدفع والبيانات البنكية

### 📝 بيانات تجريبية

يتضمن التطبيق بيانات تجريبية:
- 3 عملاء نموذجيين
- 22 عنصر في قائمة الأسعار عبر 5 فئات
- فاتورة نموذجية واحدة

### 🤝 المساهمة

المساهمات مرحب بها! لا تتردد في تقديم Pull Request.

### 📄 الترخيص

هذا المشروع مفتوح المصدر ومتاح تحت [رخصة MIT](LICENSE).

---

## 📸 Screenshots

### Dashboard
![Dashboard](/screenshots/dashboard.png)

### Invoice List
![Invoice List](/screenshots/invoices.png)

### Create Invoice
![Create Invoice](/screenshots/new-invoice.png)

### Price List with Sizes
![Price List](/screenshots/pricelist.png)

---

## 🔗 Links

- **Live Demo**: [Coming Soon]
- **Documentation**: [Wiki](https://github.com/yourusername/umzugsmanager/wiki)
- **Issues**: [GitHub Issues](https://github.com/yourusername/umzugsmanager/issues)

---

Made with ❤️ for Moving Companies
