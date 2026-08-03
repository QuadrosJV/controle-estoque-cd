# Product Expiry Control System — Implementation Plan

## Context

Build a complete corporate web application for warehouse product expiry date management. The app uses LocalStorage today but must be architected with a clean service layer so the storage backend can be swapped for a REST API later without touching the UI. The existing project is React 19 + Vite + Tailwind CSS v4 — we'll add missing dependencies (React Router DOM, React Hook Form, Zod, date-fns, Lucide React, ExcelJS) and restructure the `src/` directory fully.

**Aesthetic:** Minimalist corporate — deep navy sidebar, white card surfaces, Geist Sans for headings, Inter for body, mono for data labels. Status colors: red (expired), amber (critical ≤7 days), yellow (warning ≤30 days), emerald (good). Clean, data-dense, authoritative.

---

## Dependencies to Install

```
pnpm add react-router-dom react-hook-form zod @hookform/resolvers date-fns lucide-react exceljs
pnpm add -D @types/node
```

Note: React 19 is already present; React Router DOM v7 is compatible.

---

## Project Structure

```
src/
├── types/
│   └── index.ts            # Product, Category, ExpiryStatus, FilterState types
├── services/
│   └── productService.ts   # CRUD interface + LocalStorage implementation
├── hooks/
│   ├── useProducts.ts      # Products state + CRUD operations
│   └── useFilters.ts       # Filter/sort state management
├── utils/
│   ├── dateUtils.ts        # getExpiryStatus, formatDate, daysUntilExpiry
│   └── exportUtils.ts      # ExcelJS export logic
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── Layout.tsx
│   ├── ui/
│   │   ├── Badge.tsx       # ExpiryStatus badge (color-coded)
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Modal.tsx
│   │   ├── ConfirmDialog.tsx
│   │   └── EmptyState.tsx
│   ├── products/
│   │   ├── ProductTable.tsx
│   │   ├── ProductForm.tsx  # React Hook Form + Zod
│   │   └── ProductFilters.tsx
│   └── dashboard/
│       ├── StatCard.tsx
│       └── ExpiryChart.tsx  # Bar chart via inline SVG or recharts-free approach
├── pages/
│   ├── DashboardPage.tsx
│   ├── ProductsPage.tsx
│   ├── AlertsPage.tsx
│   └── ReportsPage.tsx
├── assets/                 # (empty, reserved)
├── App.tsx                 # Router + Layout wrapper
├── main.tsx
└── index.css               # Google Fonts imports + Tailwind + CSS tokens
```

---

## Data Model

```typescript
// types/index.ts
export type ExpiryStatus = 'expired' | 'critical' | 'warning' | 'good';

export interface Product {
  id: string;
  name: string;
  category: string;
  batch: string;
  quantity: number;
  unit: string;
  expiryDate: string;      // ISO date string YYYY-MM-DD
  location: string;        // shelf/aisle
  supplier?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FilterState {
  search: string;
  category: string;
  status: ExpiryStatus | 'all';
  sortBy: 'expiryDate' | 'name' | 'category' | 'updatedAt';
  sortDir: 'asc' | 'desc';
}
```

---

## Service Layer (Swappable)

`productService.ts` exports an interface `IProductService` and a concrete `LocalStorageProductService`. Hooks consume the interface only — swapping for a REST implementation means only changing the import in a single place.

```typescript
export interface IProductService {
  getAll(): Promise<Product[]>;
  getById(id: string): Promise<Product | null>;
  create(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product>;
  update(id: string, data: Partial<Product>): Promise<Product>;
  delete(id: string): Promise<void>;
}
```

---

## Pages

### DashboardPage
- 4 StatCards: Total products, Expired, Critical (≤7d), Expiring soon (≤30d)
- Horizontal bar chart — products per expiry status (CSS-based, no library)
- Recent alerts list: 5 nearest-expiring products

### ProductsPage
- Full table with columns: Name, Category, Batch, Qty, Expiry Date, Days Left, Status, Location, Actions
- Search + Category filter + Status filter
- Sortable columns
- Add / Edit (modal with ProductForm) / Delete (confirm dialog)

### AlertsPage
- Tabbed: Expired | Critical | Warning
- Each tab shows a filtered table with highlighted rows
- Bulk acknowledge (mark reviewed) action

### ReportsPage
- Date range picker for export window
- Category multi-filter
- Preview count of matching records
- Export to Excel button → ExcelJS generates .xlsx with product data + color-coded rows

---

## Expiry Status Logic (`utils/dateUtils.ts`)

```typescript
export function getExpiryStatus(expiryDate: string): ExpiryStatus {
  const days = differenceInDays(parseISO(expiryDate), startOfToday());
  if (days < 0) return 'expired';
  if (days <= 7) return 'critical';
  if (days <= 30) return 'warning';
  return 'good';
}
```

---

## Aesthetic / Styling

**Fonts (Vite — CSS @import in `src/index.css`):**
- `Inter` (body) + `Geist` (headings, via Google Fonts) + `JetBrains Mono` (data labels)

**CSS tokens in `src/index.css`:**
```css
:root {
  --background: #f8fafc;
  --foreground: #0f172a;
  --card: #ffffff;
  --card-foreground: #1e293b;
  --primary: #1e3a5f;        /* deep navy */
  --primary-foreground: #f8fafc;
  --secondary: #f1f5f9;
  --secondary-foreground: #475569;
  --muted: #f1f5f9;
  --muted-foreground: #64748b;
  --accent: #2563eb;         /* electric blue */
  --accent-foreground: #ffffff;
  --border: #e2e8f0;
  --ring: #2563eb;
  --radius: 0.5rem;
  /* status */
  --expired: #dc2626;
  --critical: #ea580c;
  --warning: #ca8a04;
  --good: #16a34a;
}
```

Sidebar: `bg-[var(--primary)]` with white text. Cards: white with subtle border. Table rows: striped with hover.

---

## Seed Data

On first load, if LocalStorage is empty, seed 20 realistic products across categories (Alimentos, Medicamentos, Produtos de Limpeza, Cosméticos) with varied expiry dates covering all 4 status zones — so the dashboard is immediately useful.

---

## Verification

1. Run app and navigate all 4 pages — no console errors
2. Add a product → appears in table with correct status badge
3. Edit product → changes persisted across page refresh
4. Delete product → confirm dialog → removed from table
5. Alerts page shows correctly filtered tabs
6. Reports page exports .xlsx with colored rows
7. Refresh browser → LocalStorage data persists correctly
