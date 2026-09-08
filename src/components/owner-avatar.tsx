import Image from "next/image";

const COLORS = [
  "bg-sky-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-violet-500",
  "bg-cyan-600",
];

function colorFor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash + name.charCodeAt(i)) % COLORS.length;
  return COLORS[hash];
}

export function OwnerAvatar({
  name,
  avatarUrl,
  size = 20,
}: {
  name: string;
  avatarUrl: string | null;
  size?: number;
}) {
  if (avatarUrl) {
    return (
      <Image
        src={avatarUrl}
        alt={name}
        width={size}
        height={size}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }

  const initial = name.trim().charAt(0).toUpperCase() || "?";

  return (
    <span
      className={`flex items-center justify-center rounded-full font-medium text-white ${colorFor(name)}`}
      style={{ width: size, height: size, fontSize: size * 0.5 }}
      aria-hidden="true"
    >
      {initial}
    </span>
  );
}
