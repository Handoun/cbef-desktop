import { useState } from 'react';

interface StickerManagerProps {
  onSendSticker: (url: string) => void;
  onClose: () => void;
}

export default function StickerManager({ onSendSticker, onClose }: StickerManagerProps) {
  const [customStickers, setCustomStickers] = useState<string[]>(
    JSON.parse(localStorage.getItem('customStickers') || '[]')
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const updated = [...customStickers, reader.result as string];
      setCustomStickers(updated);
      localStorage.setItem('customStickers', JSON.stringify(updated));
    };
    reader.readAsDataURL(file);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 200,
      }}
    >
      <div
        style={{
          background: 'white',
          padding: 20,
          borderRadius: 20,
          width: 300,
          maxHeight: 400,
          overflowY: 'auto',
          color: '#1a1a1a',
        }}
      >
        <h3>Мои стикеры</h3>
        <input type="file" accept="image/*" onChange={handleFileUpload} />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
          {customStickers.map((s, i) => (
            <img
              key={i}
              src={s}
              alt="sticker"
              onClick={() => onSendSticker(s)}
              style={{
                width: 64,
                height: 64,
                cursor: 'pointer',
                objectFit: 'cover',
                borderRadius: 8,
              }}
            />
          ))}
        </div>
        <button onClick={onClose} style={{ marginTop: 12 }}>
          Закрыть
        </button>
      </div>
    </div>
  );
}