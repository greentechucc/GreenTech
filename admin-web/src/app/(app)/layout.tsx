import { Sidebar } from '@/components/layout/Sidebar';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex bg-background min-h-screen relative">
      <div className="bg-grid"></div>
      <Sidebar />
      <main className="flex-1 md:ml-[18rem] ml-0 p-4 md:p-8 h-screen overflow-y-auto w-full pt-20 md:pt-8 transition-all duration-300">
        {children}
      </main>
    </div>
  );
}
