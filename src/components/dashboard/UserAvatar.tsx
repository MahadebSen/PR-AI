import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type UserAvatarProps = {
  name?: string | null;
  image?: string | null;
  className?: string;
};

function getInitials(name?: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function UserAvatar({ name, image, className }: UserAvatarProps) {
  return (
    <Avatar className={className}>
      {image ? <AvatarImage src={image} alt={name ?? "User avatar"} /> : null}
      <AvatarFallback className="bg-secondary text-xs font-medium">
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  );
}
