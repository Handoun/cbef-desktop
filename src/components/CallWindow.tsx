import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface CallWindowProps {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  onHangUp: () => void;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onShareScreen: () => void;
  audioEnabled: boolean;
  videoEnabled: boolean;
  screenStream: MediaStream | null;
  localAvatar?: string;
  remoteAvatar?: string;
}

export default function CallWindow({
  localStream,
  remoteStream,
  onHangUp,
  onToggleAudio,
  onToggleVideo,
  onShareScreen,
  audioEnabled,
  videoEnabled,
  screenStream,
  localAvatar,
  remoteAvatar,
}: CallWindowProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const screenVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  useEffect(() => {
    if (screenVideoRef.current && screenStream) {
      screenVideoRef.current.srcObject = screenStream;
    }
  }, [screenStream]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#1a1a1a',
        zIndex: 2000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Основной экран: демонстрация или видео собеседника */}
      <div style={{ position: 'relative', width: '100%', height: '70%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        {screenStream ? (
          <video ref={screenVideoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        ) : (
          <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <video ref={remoteVideoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            {/* Аватарка собеседника (если видео выключено) */}
            {!videoEnabled && (
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                <img
                  src={remoteAvatar || 'https://via.placeholder.com/100?text=?'}
                  alt="remote avatar"
                  style={{ width: 100, height: 100, borderRadius: '50%', border: '3px solid white' }}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Своё видео (маленькое окно) */}
      <div style={{ position: 'absolute', bottom: 120, right: 20, width: 150, borderRadius: 12, overflow: 'hidden' }}>
        <video ref={localVideoRef} autoPlay playsInline muted style={{ width: '100%', height: 'auto' }} />
        {/* Аватарка себя (если видео выключено) */}
        {!videoEnabled && (
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
            <img
              src={localAvatar || 'https://via.placeholder.com/60?text=?'}
              alt="local avatar"
              style={{ width: 60, height: 60, borderRadius: '50%', border: '2px solid white' }}
            />
          </div>
        )}
      </div>

      {/* Панель управления */}
      <div style={{ position: 'absolute', bottom: 30, display: 'flex', gap: 20 }}>
        <button onClick={onToggleAudio} style={controlButtonStyle}>
          {audioEnabled ? '🎤' : '🔇'}
        </button>
        <button onClick={onToggleVideo} style={controlButtonStyle}>
          {videoEnabled ? '📹' : '📷❌'}
        </button>
        <button onClick={onShareScreen} style={controlButtonStyle}>
          {screenStream ? '🖥️✅' : '🖥️'}
        </button>
        <button onClick={onHangUp} style={{ ...controlButtonStyle, background: 'red' }}>
          📞❌
        </button>
      </div>
    </motion.div>
  );
}

const controlButtonStyle: React.CSSProperties = {
  width: 60,
  height: 60,
  borderRadius: '50%',
  fontSize: 24,
  background: '#333',
  color: 'white',
  border: 'none',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};