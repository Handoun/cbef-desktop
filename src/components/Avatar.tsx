export default function Avatar({ src, name, size = 40 }: { src?: string; name?: string; size?: number }) {
  if (src) {
    return <img src={src} alt="avatar" style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover' }} />;
  }
  const letter = (name || '?')[0].toUpperCase();
  const colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#fa709a'];
  const color = colors[letter.charCodeAt(0) % colors.length];
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontWeight: 600,
        fontSize: size * 0.4,
      }}
    >
      {letter}
    </div>
  );
}