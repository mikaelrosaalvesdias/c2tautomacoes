# C2Tech Dashboard - Guia de Migração para Next.js 14

## 📋 Visão Geral

Este documento descreve como adaptar o código React/Vite do C2Tech para seu projeto Next.js 14 com NocoDB.

---

## 🔄 Estrutura de Migração

### Mapeamento de Arquivos

**React/Vite → Next.js 14**

```
client/src/pages/Home.tsx          → app/(app)/page.tsx (Dashboard)
client/src/pages/Login.tsx         → app/login/page.tsx
client/src/pages/Inbox.tsx         → app/(app)/inbox/page.tsx
client/src/pages/Acoes.tsx         → app/(app)/acoes/page.tsx
client/src/pages/Emails.tsx        → app/(app)/emails/page.tsx
client/src/pages/Cancelamentos.tsx → app/(app)/cancelamentos/page.tsx

client/src/components/Sidebar.tsx  → components/SidebarNav.tsx
client/src/index.css               → app/globals.css (merge)
```

---

## 🎨 Design System (Mantém-se igual)

### Paleta de Cores Neon Cyberpunk
```
Verde Neon: #00FF00
Amarelo: #FFD700
Roxo: #8A2BE2
Vermelho: #FF4444
Background: #1A1A1A
Card BG: #2C2C2C
```

### Tipografia
```
Display: Space Mono (bold)
Body: Inter (regular/medium)
```

---

## 📝 Passos de Implementação

### 1. Copiar Componentes UI

Copie todos os componentes de `client/src/components/ui/` para `components/ui/` do seu projeto Next.js. Eles são agnósticos de framework.

### 2. Criar Componentes Específicos

#### `components/SidebarNav.tsx`
```typescript
'use client';

import { usePathname, useRouter } from 'next/navigation';
import { BarChart3, Mail, Zap, X, Send, LogOut, Settings } from 'lucide-react';

export default function SidebarNav() {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, path: '/' },
    { id: 'inbox', label: 'Inbox', icon: Mail, path: '/inbox' },
    { id: 'acoes', label: 'Ações', icon: Zap, path: '/acoes' },
    { id: 'cancelamentos', label: 'Cancelamentos', icon: X, path: '/cancelamentos' },
    { id: 'emails', label: 'Emails', icon: Send, path: '/emails' },
  ];

  return (
    <aside className="w-64 border-r" style={{ borderColor: '#2C2C2C', backgroundColor: '#1A1A1A' }}>
      <div className="p-6 space-y-8">
        {/* Logo */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-wider">
            <span style={{ color: '#00FF00' }}>automacoes_</span>
            <span className="text-white">c2tech</span>
          </h1>
          <div className="h-1 w-24" style={{ backgroundColor: '#00FF00' }} />
        </div>

        {/* Navigation */}
        <nav className="space-y-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <button
                key={item.id}
                onClick={() => router.push(item.path)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all"
                style={
                  isActive
                    ? { backgroundColor: '#00FF00', color: '#000000' }
                    : { color: '#999999' }
                }
              >
                <Icon size={20} />
                <span className={isActive ? 'font-semibold' : ''}>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="space-y-3 border-t pt-6" style={{ borderColor: '#333333' }}>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white">
            <Settings size={20} />
            <span>Configurações</span>
          </button>
          <button
            onClick={() => router.push('/login')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white"
          >
            <LogOut size={20} />
            <span>Sair</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
```

#### `components/AppShell.tsx`
```typescript
'use client';

import SidebarNav from './SidebarNav';

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-black text-white" style={{ backgroundColor: '#1A1A1A' }}>
      <SidebarNav />
      <div className="flex-1 flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}
```

### 3. Converter Páginas React para Server Components Next.js

#### `app/(app)/page.tsx` (Dashboard)
```typescript
import { requirePageAuth } from '@/lib/auth';
import DashboardContent from '@/components/DashboardContent';

export default async function DashboardPage() {
  const session = await requirePageAuth();

  return (
    <>
      <header className="border-b px-8 py-4" style={{ borderColor: '#2C2C2C', backgroundColor: '#2C2C2C' }}>
        <h2 className="text-3xl font-bold">Dashboard</h2>
      </header>
      <main className="flex-1 overflow-auto p-8">
        <DashboardContent />
      </main>
    </>
  );
}
```

#### `app/(app)/inbox/page.tsx`
```typescript
import { requirePageAuth } from '@/lib/auth';
import { getInboxData } from '@/lib/nocodb';
import InboxList from '@/components/inbox-list';

export default async function InboxPage() {
  const session = await requirePageAuth();
  const data = await getInboxData();

  return (
    <>
      <header className="border-b px-8 py-4" style={{ borderColor: '#2C2C2C', backgroundColor: '#2C2C2C' }}>
        <h2 className="text-3xl font-bold">Inbox</h2>
      </header>
      <main className="flex-1 overflow-auto p-8">
        <InboxList data={data} />
      </main>
    </>
  );
}
```

### 4. Criar Client Components para Interatividade

#### `components/DashboardContent.tsx`
```typescript
'use client';

import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Mail, Zap, X, Send } from 'lucide-react';

const donutColors = ['#00FF00', '#FFD700', '#8A2BE2', '#FF6B35', '#4A90E2', '#7B68EE'];

export default function DashboardContent() {
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);

  const metrics = { emails: 342, acoes: 87, cancelamentos: 12, enviados: 156 };
  const lineData = [
    { day: '1', value: 100 },
    { day: '2', value: 150 },
    // ... mais dados
  ];
  const donutData = [
    { name: 'Empresa A', value: 43, fill: '#00FF00' },
    { name: 'Empresa B', value: 25, fill: '#FFD700' },
    // ... mais dados
  ];

  return (
    <div className="space-y-6">
      {/* Cartões de Métricas */}
      <div className="grid grid-cols-4 gap-4">
        <div className="border-2 rounded-2xl p-6" style={{ borderColor: '#00FF00', backgroundColor: '#2C2C2C' }}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm">Emails Recebidos:</p>
              <p className="text-4xl font-bold mt-2">{metrics.emails}</p>
            </div>
            <Mail size={24} style={{ color: '#00FF00' }} />
          </div>
        </div>
        {/* ... mais cartões */}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-2 gap-4">
        {/* LineChart */}
        {/* PieChart */}
      </div>
    </div>
  );
}
```

### 5. Integração com NocoDB

#### `lib/nocodb-client.ts`
```typescript
import axios from 'axios';

const NOCODB_BASE_URL = process.env.NOCODB_BASE_URL;
const NOCODB_TOKEN = process.env.NOCODB_XC_TOKEN;
const NOCODB_BASE_ID = process.env.NOCODB_BASE_ID;

const nocodbClient = axios.create({
  baseURL: `${NOCODB_BASE_URL}/api/v1/db/data/v1/${NOCODB_BASE_ID}`,
  headers: {
    'xc-auth': NOCODB_TOKEN,
  },
});

export async function getInboxData() {
  try {
    const response = await nocodbClient.get('/chegada_suporte');
    return response.data.list || [];
  } catch (error) {
    console.error('Erro ao buscar inbox:', error);
    return [];
  }
}

export async function getAcoesData() {
  try {
    const response = await nocodbClient.get('/acoes_automacao');
    return response.data.list || [];
  } catch (error) {
    console.error('Erro ao buscar ações:', error);
    return [];
  }
}

export async function getEmailsData() {
  try {
    const response = await nocodbClient.get('/emails_comercial');
    return response.data.list || [];
  } catch (error) {
    console.error('Erro ao buscar emails:', error);
    return [];
  }
}
```

### 6. Estilos CSS

Adicione ao seu `app/globals.css`:

```css
/* Cores Neon */
:root {
  --color-neon-green: #00FF00;
  --color-neon-yellow: #FFD700;
  --color-neon-purple: #8A2BE2;
  --color-neon-red: #FF4444;
  --bg-primary: #1A1A1A;
  --bg-card: #2C2C2C;
  --border-dark: #333333;
}

body {
  background-color: var(--bg-primary);
  color: #ffffff;
}

/* Glow Effects */
.glow-green {
  box-shadow: 0 0 20px rgba(0, 255, 0, 0.3);
}

.glow-purple {
  box-shadow: 0 0 40px rgba(138, 43, 226, 0.3), inset 0 0 20px rgba(138, 43, 226, 0.1);
}

/* Hover Effects */
.card-hover {
  transition: all 0.3s ease;
}

.card-hover:hover {
  transform: scale(1.02);
  box-shadow: 0 0 20px rgba(0, 255, 0, 0.3);
}
```

---

## 🚀 Checklist de Implementação

- [ ] Copiar componentes UI
- [ ] Criar SidebarNav.tsx
- [ ] Criar AppShell.tsx
- [ ] Converter Dashboard (Home.tsx → page.tsx)
- [ ] Converter Inbox
- [ ] Converter Ações
- [ ] Converter Emails
- [ ] Converter Cancelamentos
- [ ] Integrar com NocoDB
- [ ] Testar autenticação
- [ ] Testar navegação
- [ ] Testar gráficos
- [ ] Testar responsividade

---

## 📚 Referências

- [Next.js 14 Documentation](https://nextjs.org/docs)
- [Recharts Documentation](https://recharts.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide React Icons](https://lucide.dev/)
