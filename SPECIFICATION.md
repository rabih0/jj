# مستند كامل للمطوّر — تطبيق ويب لإنشاء فواتير PDF (لغة: ألمانية)

نسخة شاملة للتنفيذ: Next.js (React) — Tailwind — Dexie.js — pdf-lib — i18n (react-i18next)
تخزين محلي بالكامل (IndexedDB). معاينة PDF منبثقة بحجم A4 صديقة للجوال.

---

## 1 — ملخص المشروع (Project Summary)

تطبيق ويب Responsive لإنشاء فواتير A4 بصيغة PDF، مع:
*   واجهة زجاجية عصرية (glassmorphism).
*   نافذة معاينة منبثقة تعرض PDF (A4) قابلة للعرض على الهواتف.
*   قسم إدارة المهام (Tasks) يُحفظ محليًا ويُسهل اختيارها داخل صفحة إنشاء الفاتورة.
*   إدارة عملاء، بيانات الشركة، حفظ الفواتير محليًا ومشاركة/تنزيل PDF.
*   لغة واجهة: ألمانية (de) مع بنية i18n قابلة لإضافة لغات لاحقًا.

---

## 2 — نطاق الوظائف (Features / Requirements)

1.  إنشاء فاتورة جديدة من اختيار العميل وبنود مأخوذة من المهام المحفوظة.
2.  واجهة لإدارة المهام (CRUD).
3.  تخزين محلي لجميع البيانات (IndexedDB عبر Dexie.js).
4.  إنشاء PDF A4 داخل المتصفح (pdf-lib) ودعمه للأحرف الألمانية (Umlauts).
5.  نافذة معاينة PDF منبثقة (Modal) بحجم A4 قابلة للطباعة والمشاركة.
6.  حفظ الفاتورة (مع بيانات البنود والمجموعات) في IndexedDB، وفتحها لاحقًا لتحريرها.
7.  إعداد بيانات الشركة (logo، اسم، عنوان، هاتف، VAT…) تظهر تلقائياً في الفواتير.
8.  واجهة أنيقة وبسيطة، بالعربية أو الإنجليزية لأغراض التطوير، لكن اللغة الافتراضية للمستخدم النهائي هي الألمانية.
9.  إمكانية مشاركة PDF عبر Web Share API وتنزيله.
10. (اختياري لاحقًا) نسخ احتياطي/مزامنة سرفر — لكن الأولوية: offline-first.

---

## 3 — المقترح التقني (Tech Stack)

*   إطار العمل: Next.js (React) — SPA/ISR حسب الحاجة.
*   لغة: TypeScript (قوي للـ developer experience).
*   تصميم: Tailwind CSS (glassmorphism عبر backdrop-filter).
*   إدارة الحالة: Zustand أو React Context (خياران خفيفان)؛ React Query للـ async إذا أضفنا سرفر.
*   تخزين محلي: IndexedDB عبر Dexie.js (موثوق وكفؤ للفواتير/ملفات كبيرة).
*   إنشاء PDF: pdf-lib (يدعم تضمين خطوط وصور).
*   معاينة PDF: عرض Blob URL داخل `<iframe>` داخل Modal، أو استخدام PDF.js لميزات متقدمة.
*   i18n: react-i18next.
*   اختبار: Jest + React Testing Library (unit + integration)، Cypress (E2E).
*   نشر: Vercel أو Netlify (static / serverless).

---

## 4 — بنية المشروع (Proposed Folder Structure)

```
/src
  /components
    /invoice
      InvoiceForm.tsx
      InvoicePreviewModal.tsx
      InvoiceItemRow.tsx
    /tasks
      TaskList.tsx
      TaskForm.tsx
    /clients
      ClientForm.tsx
    /company
      CompanyForm.tsx
    /ui
      Modal.tsx
      GlassCard.tsx
      Button.tsx
  /lib
    pdf.ts            // functions to build PDF (pdf-lib)
    db.ts             // Dexie DB schema + helpers
    i18n.ts
  /pages
    index.tsx
    /invoices
      new.tsx
      [id].tsx
    /tasks
      index.tsx
    /clients
    /company
  /styles
    globals.css
    tailwind.css
  /utils
    format.ts
    numbering.ts
  /tests
```

---

## 5 — قاعدة البيانات المحلية (IndexedDB via Dexie) — Schema

استخدم Dexie مع ثلاث جداول رئيسية: tasks, clients, company_info, invoices, invoice_items (يمكن تضمين items داخل invoices كمصفوفة أيضاً).

**مثال تعريف Dexie (TypeScript)**

```typescript
// src/lib/db.ts
import Dexie, { Table } from 'dexie';

export interface Task {
  id?: number;
  title: string;
  description?: string;
  unit_price: number;
  default_qty?: number;
  tags?: string[];
  created_at?: string;
}

export interface Client {
  id?: number;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  tax_id?: string;
  notes?: string;
}

export interface CompanyInfo {
  id?: number; // always 1
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  vat_info?: string;
  logo_base64?: string;
}

export interface InvoiceItem {
  task_id?: number | null;
  title: string;
  qty: number;
  price: number;
  total: number;
}

export interface Invoice {
  id?: number;
  invoice_number: string;
  client_id?: number | null;
  client_snapshot?: Client; // denormalized snapshot
  company_snapshot?: CompanyInfo;
  date: string;
  due_date?: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  status?: 'draft' | 'sent' | 'paid';
  pdf_blob?: Blob; // optional, or store URL
  created_at?: string;
}

class AppDB extends Dexie {
  tasks!: Table<Task, number>;
  clients!: Table<Client, number>;
  company!: Table<CompanyInfo, number>;
  invoices!: Table<Invoice, number>;

  constructor() {
    super('InvoiceAppDB');
    this.version(1).stores({
      tasks: '++id, title, created_at',
      clients: '++id, name, email',
      company: '++id',
      invoices: '++id, invoice_number, date, status'
    });
  }
}

export const db = new AppDB();
```

ملاحظة: تخزين pdf_blob في IndexedDB ممكن، لكنه يزيد حجم DB. بدلاً من ذلك خزّن pdf_blob في FileSystem API أو لا تحفظه مطلقًا إذا يمكن إعادة إنشائه.

---

## 6 — تصميم واجهات وشرح المكونات (Wireframes & Behavior)

أصف كل شاشة وسلوكها:

### 6.1 لوحة رئيسية (/)
*   قائمة الفواتير الأخيرة (ID, client, total, status).
*   زر كبير: Neue Rechnung (إنشاء فاتورة جديدة).
*   زر للوصول السريع لإدارة المهام Meine Aufgaben.

### 6.2 إنشاء فاتورة (/invoices/new)
قسمان (responsive):
*   **اليسار:** نموذج الفاتورة (fields)
    *   Kunde wählen (زر/بحث لاختيار عميل أو إضافة جديد)
    *   Rechnungsdatum، Fälligkeitsdatum
    *   جدول البنود: لكل بند — حقل اختيار من المهام → يملأ title,price، يمكن تعديل الكمية والسعر يدوياً.
    *   حقل Notizen
    *   ملخص الحساب: Zwischensumme, MwSt (مثلاً 19% أو 7%), Gesamt
    *   أزرار: Vorschau ansehen (معاينة)، PDF erstellen (إنشاء + تنزيل + حفظ).
*   **اليمين:** لوحة مساعدة زجاجية (GlassCard)
    *   زر فتح Meine Aufgaben (side drawer)
    *   بيانات الشركة المصغرة (logo, name) + إعدادات سريعة.

### 6.3 معاينة PDF (Modal)
*   يظهر Modal يغطي معظم الشاشة على الموبايل (full-screen modal)، ويعرض `<iframe src={blobUrl}>`.
*   أزرار: Schließen, Herunterladen, Teilen, Drucken.

### 6.4 إدارة المهام (/tasks)
*   قائمة مهام مع شريط بحث وفلتر.
*   كل مهمة: Titel, Preis, زر تعديل، زر حذف.
*   زر Neue Aufgabe يفتح Form صغير.

### 6.5 إعدادات الشركة (/company)
*   Form لحفظ اسم الشركة، العنوان، رقم الهاتف، البريد، VAT، ورفع لوجو (تحويله إلى base64 وتخزينه في DB).

---

## 7 — توليد PDF (pdf-lib) — المواصفات الفنية

*   صفحة واحدة أو متعددة A4 (595.28 × 841.89 نقاط عند 72 DPI)، مع هوامش قابلة للتعديل (مثلاً 40pt).
*   يجب تضمين خط يدعم Umlauts: استخدم ملف خط TTF (مثلاً Inter أو Noto Sans) وتضمينه `pdfDoc.embedFont(await fetch(...).then(r=>r.arrayBuffer()))`.
*   تضمين لوجو الشركة (PNG / JPEG) كـ embedded image.
*   تنسيق جدول البنود: أعمدة: وصف، كمية، سعر الوحدة، المجموع.
*   إضافة صف الملخص: إجمالي فرعي، ضريبة (%), الإجمالي النهائي.
*   إضافة توقيع نصي أو صورة (اختياري).
*   توليد PDFBytes ثم إنشاء Blob وURL.

**مثال وظائف (TypeScript) — مبسّط**

```typescript
// src/lib/pdf.ts
import { PDFDocument, rgb } from 'pdf-lib';

export async function buildInvoicePdf(invoice: Invoice, company: CompanyInfo) {
  const pdfDoc = await PDFDocument.create();
  // embed font (fetch locally stored font file)
  const fontBytes = await fetch('/fonts/NotoSans-Regular.ttf').then(r=>r.arrayBuffer());
  const font = await pdfDoc.embedFont(fontBytes);

  const page = pdfDoc.addPage([595.28, 841.89]); // A4
  const { width, height } = page.getSize();
  const margin = 40;

  // Draw company name
  page.drawText(company.name || '', { x: margin, y: height - margin - 20, size: 14, font });

  // Draw client info
  page.drawText('Rechnung an:', { x: margin, y: height - margin - 60, size: 10, font });
  page.drawText(invoice.client_snapshot?.name || '', { x: margin, y: height - margin - 75, size: 10, font });

  // Draw table header...
  // Loop items and draw text...

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  return { blob, url };
}
```
ملاحظة: هذا نموذج مبسّط — يجب حساب إزاحة Y لكل سطر وإضافة page breaks إذا لزم.

---

## 8 — i18n: مفاتيح النصوص (German de.json)

قدّم ملف ترجمة مبدئي لجميع النصوص المهمة.

```json
{
  "app": {
    "title": "Rechnungssteller",
    "new_invoice": "Neue Rechnung",
    "tasks": "Meine Aufgaben",
    "clients": "Kunden",
    "company": "Firma",
    "settings": "Einstellungen"
  },
  "invoice": {
    "preview": "Vorschau ansehen",
    "create_pdf": "PDF erstellen",
    "invoice_number": "Rechnungsnummer",
    "date": "Rechnungsdatum",
    "due_date": "Fälligkeitsdatum",
    "notes": "Notizen",
    "subtotal": "Zwischensumme",
    "tax": "MwSt",
    "total": "Gesamt"
  },
  "task": {
    "title": "Aufgabenname",
    "price": "Preis",
    "add_task": "Neue Aufgabe",
    "edit": "Bearbeiten",
    "delete": "Löschen"
  },
  "modal": {
    "close": "Schließen",
    "download": "Herunterladen",
    "share": "Teilen",
    "print": "Drucken"
  }
}
```

---

## 9 — واجهة Glass UI (اقتراح CSS/Tailwind)

```css
/* globals.css */
.glass {
  background: rgba(255,255,255,0.12);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255,255,255,0.18);
  border-radius: 12px;
  padding: 16px;
}
```

Tailwind example:

```html
<div class="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4">
  <!-- content -->
</div>
```

---

## 10 — سلوك الـ Modal للمعاينة (UX details)
*   عند النقر على Vorschau ansehen: تولد PDF مؤقتاً (Blob URL) وتفتح Modal مع `<iframe src={blobUrl} />`.
*   في الجوال: Modal يكون full-screen، مع زر Teilen يستعمل `navigator.share({ files: [new File([blob], 'rechnung.pdf', { type: 'application/pdf' })] })` إن كان مدعوماً، أو عرض زر تنزيل كاحتياط.
*   زر Drucken يقوم بفتح الـ Blob في نافذة جديدة ثم `window.print()`.

---

## 11 — نقاط الأمن والخصوصية
*   بيانات المستخدم تبقى محلياً (offline-first) — أوضّح ذلك في سياسة الخصوصية.
*   عند إضافة خيار Backups/Sync: استخدم HTTPS و JWT + تشفير الحقول الحسّاسة.
*   افحص الملفات المرفوعة (logo) للحد من ملفات ضخمة جداً.
*   CSP headers عند النشر (prevent XSS).

---

## 12 — اختبار (QA Checklist)
*   إنشاء فاتورة جديدة مع 1 بند، تحقق من الحسابات (subtotal, tax, total).
*   إنشاء فاتورة مع > 1 صفحة (تحقق من page break في PDF).
*   معاينة PDF في جهاز موبايل (Android + iOS).
*   تنزيل ومشاركة PDF (Web Share + تنزيل الملف).
*   CRUD للمهام: إنشاء → اختيار داخل الفاتورة → حذف → معالجة البنود القديمة.
*   حفظ البيانات واسترجاعها من IndexedDB.
*   تحقق دعم الأحرف الألمانية (ä, ö, ü, ß) داخل PDF.
*   اختبار الطباعة (print preview).
*   اختبارات وحدية للمكونات الأساسية (InvoiceForm, PDF builder).
*   E2E: سيناريو إنشاء فاتورة كاملة ومشاركتها.

---

## 13 — API spec (اختياري — للنسخ الاحتياطي/مزامنة لاحقًا)

إذا قررت إضافة سرفر لاحقًا، هذا spec مبدئي (REST API):
*   `POST /api/sync/invoices` — يدفع فاتورة للمزامنة (body: invoice JSON).
*   `GET /api/sync/invoices?since=timestamp` — يحصل التغييرات.
*   `POST /api/auth/login` — تسجيل دخول (JWT).
*   استخدام HTTPS + OAuth2 أو JWT.

تنبيه: لا تنفّذ سرفر إلا إذا كنت مستعدًا للتعامل مع خصوصية البيانات والـ GDPR.

---

## 14 — متطلبات التسليم (Deliverables للمطور أو العميل)
1.  Repo جاهز (Next.js + Tailwind + Typescript) مع بنية المجلدات أعلاه.
2.  ملف `src/lib/db.ts` مع سكيم Dexie.
3.  ملف `src/lib/pdf.ts` مع دوال إنشاء PDF (قابلة لإعادة الاستخدام).
4.  مكونات الواجهة: InvoiceForm, InvoicePreviewModal, TaskList.
5.  ملفات i18n (de.json) وملف إعداد `i18n.ts`.
6.  وثيقة اختبار (QA checklist مثبتة).
7.  ملف Readme يشرح كيفية تشغيل المشروع محليًا (npm install, npm run dev).
8.  Figma / PNG mockups لشاشات: Create Invoice, Tasks, Company, Preview Modal. (إذا تريده أقدر أجهز mockups).

---

## 15 — قائمة مهام تنفيذية (Task List for Dev — Copy-paste to Issue Tracker)
1.  Bootstrapping project (Next.js + TypeScript + Tailwind).
2.  Setup Dexie DB & types.
3.  Implement Company settings page (with logo upload).
4.  Implement Tasks CRUD (UI + DB).
5.  Implement Clients CRUD (UI + DB).
6.  Implement InvoiceForm (select client, select tasks, edit qty/price).
7.  Implement PDF builder (src/lib/pdf.ts) — include font + logo.
8.  Implement InvoicePreviewModal (iframe display + download/share/print).
9.  Implement saving invoices to DB.
10. i18n integration (react-i18next) and German translations.
11. Responsive styles + Glass UI polish.
12. Unit tests & E2E tests.
13. CI/CD & deployment (Vercel).

---

## 16 — Acceptance Criteria (معايير القبول)
*   يمكن إنشاء فاتورة جديدة واختيار مهام محفوظة وإنتاج PDF صحيح A4.
*   المعاينة تظهر في Modal وتعرض نفس محتوى PDF النهائي.
*   المستخدم يمكنه تنزيل الملف ومشاركته من الموبايل.
*   البيانات (مهام، عملاء، شركة، فواتير) محفوظة محليًا وتبقى بعد إعادة تحميل الصفحة.
*   الواجهة الألمانية تظهر لكل النصوص الأساسية.
*   دعم صحيح للحروف الألمانية داخل الـ PDF.

---

## 17 — ملاحظات مطوّرة / Tips للمبرمج
*   لا تحفظ Blob URLs في DB — حافظ على القدرة على إعادة إنشائه.
*   اجعل بنية الـ Invoice مرنة (allow custom lines that aren’t tasks).
*   استخدم lazy-loading للخطوط (embed only when building PDF).
*   إذا أردت دعم طباعة احترافية: جرّب توليد PDF server-side (headless) لاحقًا.

---

## 18 — أمثلة أكواد إضافية مفيدة

**A) تحويل صورة لوجو إلى base64 (browser)**

```typescript
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
```

**B) مشاركة PDF (Web Share)**

```typescript
async function sharePdf(blob: Blob) {
  if (navigator.canShare && navigator.canShare({ files: [new File([blob], 'rechnung.pdf', { type: 'application/pdf' })] })) {
    await navigator.share({
      files: [new File([blob], 'rechnung.pdf', { type: 'application/pdf' })],
      title: 'Rechnung',
      text: 'Hier ist Ihre Rechnung'
    });
  } else {
    // fallback: download
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'rechnung.pdf';
    a.click();
    URL.revokeObjectURL(url);
  }
}
```
