import { useState } from 'react';
import { motion } from 'framer-motion';

interface StickerPack {
  id: string;
  name: string;
  author: string;
  stickers: string[]; // эмодзи или base64
}

const packs: StickerPack[] = [
  {
    id: 'emojis',
    name: 'Классические смайлы',
    author: 'CBEF',
    stickers: ['😊', '😂', '😍', '👍', '🎉', '🔥', '❤️', '💯', '🥳', '😎', '🤩', '😇'],
  },
  {
    id: 'animals',
    name: 'Животные',
    author: 'CBEF',
    stickers: ['🐶', '🐱', '🦊', '🐼', '🐨', '🐸', '🦄', '🐙', '🐳', '🦋', '🐞', '🦜'],
  },
  {
    id: 'food',
    name: 'Еда',
    author: 'CBEF',
    stickers: ['🍔', '🍕', '🍣', '🍩', '🍓', '🍇', '🥑', '🌮', '🍿', '🍪', '🧁', '🍭'],
  },
];

interface StickerPackViewerProps {
  onSelectSticker: (url: string) => void;
  onClose: () => void;
}

export default function StickerPackViewer({ onSelectSticker, onClose }: StickerPackViewerProps) {
  const [selectedPack, setSelectedPack] = useState<StickerPack>(packs[0]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 200,
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        style={{
          backgroundColor: 'var(--sidebar-bg)', borderRadius: 24,
          padding: 24, width: '90%', maxWidth: 500, maxHeight: '80vh',
          overflow: 'auto', color: 'var(--text-primary)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <h3 style={{ marginBottom: 16 }}>📦 Стикерпаки</h3>
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {packs.map(pack => (
            <button
              key={pack.id}
              onClick={() => setSelectedPack(pack)}
              style={{
                padding: '6px 14px', borderRadius: 20,
                background: selectedPack.id === pack.id ? 'var(--button-bg)' : 'transparent',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)', cursor: 'pointer',
                fontWeight: selectedPack.id === pack.id ? 600 : 400,
              }}
            >
              {pack.name}
            </button>
          ))}
        </div>
        <div style={{ opacity: 0.7, fontSize: 14, marginBottom: 12 }}>Автор: {selectedPack.author}</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {selectedPack.stickers.map((sticker, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onSelectSticker(sticker)}
              style={{
                fontSize: 36, textAlign: 'center', cursor: 'pointer',
                padding: 8, borderRadius: 12, backgroundColor: 'var(--hover-bg)',
                userSelect: 'none',
              }}
            >
              {sticker}
            </motion.div>
          ))}
        </div>
        <button
          onClick={onClose}
          style={{
            marginTop: 20, width: '100%', padding: 12,
            borderRadius: 20, border: 'none', background: 'var(--button-bg)',
            color: 'var(--button-text)', cursor: 'pointer', fontWeight: 600,
          }}
        >
          Закрыть
        </button>
      </motion.div>
    </motion.div>
  );
}