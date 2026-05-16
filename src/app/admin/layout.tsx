import { AdminAuthProvider } from '@/lib/adminAuthContext';

export const metadata = {
  title: 'Admin | Clinio AI',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <div className="min-h-screen bg-gray-950 text-gray-100">
        {children}
      </div>
    </AdminAuthProvider>
  );
}
