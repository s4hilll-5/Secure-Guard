/** Initials avatar generated from the user's name (no image upload needed). */
export function getInitials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'U';
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}

export default function Avatar({ name, size = 'md', online = false }) {
  const sizing = size === 'sm' ? 'h-8 w-8 text-xs' : size === 'lg' ? 'h-16 w-16 text-xl' : 'h-9 w-9 text-sm';
  return (
    <span className="relative inline-flex shrink-0">
      <span
        className={`flex items-center justify-center rounded-full bg-linear-to-br from-primary to-accent font-bold text-white ring-2 ring-line ${sizing}`}
      >
        {getInitials(name)}
      </span>
      {online && (
        <span className="absolute right-0 bottom-0 h-2.5 w-2.5 rounded-full border-2 border-surface-solid bg-success" />
      )}
    </span>
  );
}
