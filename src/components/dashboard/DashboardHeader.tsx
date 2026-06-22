import { UserMenu } from "@/components/dashboard/UserMenu";

type DashboardHeaderProps = {
  name?: string | null;
  username?: string | null;
  image?: string | null;
};

export function DashboardHeader({
  name,
  username,
  image,
}: DashboardHeaderProps) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-end border-b border-border bg-sidebar/50 px-6 md:px-8">
      <UserMenu name={name} username={username} image={image} />
    </header>
  );
}
