export default function UserAvatar({ name, size = 32 }) {
  const initials = (name || '?').split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
  return (
    <div className="bg-primary-600 text-white rounded-full flex items-center justify-center font-bold shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.4 }}>
      {initials}
    </div>
  );
}
