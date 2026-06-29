import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { requireSession } from "@/lib/auth/session";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await requireSession();
  const user = session.user;

  return (
    <div className="flex min-h-full flex-1">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardHeader
          name={user?.name}
          username={user?.username}
          image={user?.image}
        />
        <main className="flex-1 bg-background">{children}</main>
      </div>
    </div>
  );
}
