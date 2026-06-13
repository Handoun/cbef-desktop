// Полный src/components/Chat.tsx
import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import axios from 'axios';
import { Peer } from 'peerjs';
import EmojiPicker from 'emoji-picker-react';
import { motion, AnimatePresence } from 'framer-motion';
import AddFriend from './AddFriend';
import FriendRequests from './FriendRequests';
import CallWindow from './CallWindow';
import GroupCreator from './GroupCreator';
import ChannelCreator from './ChannelCreator';
import StickerManager from './StickerManager';
import StickerPackViewer from './StickerPackViewer';
import AdminPanel from './AdminPanel';
import Avatar from './Avatar';
import UpdateBanner from './UpdateBanner';

const API_URL = import.meta.env.VITE_API_URL;
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;
const PEER_HOST = import.meta.env.VITE_PEER_HOST;
const PEER_PORT = import.meta.env.VITE_PEER_PORT;
const PEER_PATH = import.meta.env.VITE_PEER_PATH;

// Стили (полный объект)
const styles: { [key: string]: React.CSSProperties & { [key: string]: any } } = {
  container: { display: 'flex', height: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', backgroundColor: 'var(--bg-color)', transition: 'background-color 0.2s ease' },
  sidebar: { width: '30%', minWidth: 280, maxWidth: 400, backgroundColor: 'var(--sidebar-bg)', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', transition: 'all 0.2s ease' },
  sidebarHeader: { padding: '16px 20px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--header-bg)' },
  sidebarTitle: { margin: 0, fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' },
  contactList: { flex: 1, overflowY: 'auto' },
  contactItem: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', cursor: 'pointer', borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.15s ease' },
  contactInfo: { display: 'flex', alignItems: 'center', gap: '12px' },
  contactName: { fontSize: '16px', fontWeight: 500, color: 'var(--text-primary)' },
  onlineDot: { width: 12, height: 12, borderRadius: '50%', backgroundColor: '#4caf50', boxShadow: '0 0 0 2px var(--sidebar-bg)' },
  offlineDot: { width: 12, height: 12, borderRadius: '50%', backgroundColor: 'var(--text-secondary)', boxShadow: '0 0 0 2px var(--sidebar-bg)' },
  addButton: { backgroundColor: 'var(--button-bg)', border: 'none', borderRadius: '24px', padding: '6px 14px', fontSize: '14px', fontWeight: 500, color: 'var(--button-text)', cursor: 'pointer', transition: 'opacity 0.15s ease' },
  chatArea: { flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--chat-bg)', backgroundImage: 'var(--chat-pattern)' },
  chatHeader: { padding: '16px 20px', backgroundColor: 'var(--header-bg)', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  chatHeaderTitle: { margin: 0, fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' },
  callButton: { backgroundColor: 'var(--button-bg)', border: 'none', borderRadius: '30px', padding: '10px 18px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--button-text)' },
  hangUpButton: { backgroundColor: '#ff4d4f', color: '#fff', border: 'none', borderRadius: '30px', padding: '10px 18px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' },
  messagesContainer: { flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' },
  messageRow: { display: 'flex', alignItems: 'flex-end' },
  messageBubble: { maxWidth: '75%', padding: '10px 14px', borderRadius: '20px', fontSize: '15px', lineHeight: 1.4, wordBreak: 'break-word', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
  messageOwn: { backgroundColor: 'var(--message-own-bg)', alignSelf: 'flex-end', borderBottomRightRadius: '4px', color: 'var(--text-primary)' },
  messageOther: { backgroundColor: 'var(--message-other-bg)', alignSelf: 'flex-start', borderBottomLeftRadius: '4px', color: 'var(--text-primary)' },
  inputContainer: { padding: '16px 20px', backgroundColor: 'var(--header-bg)', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '12px', alignItems: 'center' },
  input: { flex: 1, padding: '12px 18px', border: '1px solid var(--border-color)', borderRadius: '30px', fontSize: '15px', outline: 'none', backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)', transition: 'border-color 0.15s ease, box-shadow 0.15s ease' },
  sendButton: { backgroundColor: '#0084ff', color: '#fff', border: 'none', borderRadius: '30px', padding: '12px 24px', fontSize: '15px', fontWeight: 600, cursor: 'pointer' },
  emptyChat: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: '16px', backgroundColor: 'var(--chat-bg)' },
  iconButton: { background: 'none', border: 'none', fontSize: '26px', cursor: 'pointer', padding: '8px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  attachmentMenu: { position: 'absolute', bottom: '80px', left: '20px', backgroundColor: 'var(--sidebar-bg)', borderRadius: '20px', boxShadow: '0 8px 24px rgba(0,0,0,0.15)', padding: '12px', display: 'flex', gap: '12px', zIndex: 10 },
  stickerGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', padding: '4px' },
  sticker: { fontSize: '24px', cursor: 'pointer', textAlign: 'center', padding: 4, borderRadius: 8, transition: 'background-color 0.15s ease' },
  backButton: { background: 'none', border: 'none', fontSize: '28px', cursor: 'pointer', padding: '0 16px 0 0', color: 'var(--text-secondary)', display: 'none' },
  badge: { backgroundColor: 'red', color: 'white', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, marginLeft: 8 },
};

interface User { id: number; username: string; avatar?: string; is_admin?: boolean; banned?: boolean; }
interface Message { id: number; sender_id: number; receiver_id: number; group_id?: number; channel_id?: number; text: string; image?: string; audio?: string; status?: string; created_at: string; }

export default function Chat() {
  const [users, setUsers] = useState<User[]>([]);
  const [contacts, setContacts] = useState<User[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [channels, setChannels] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<any | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<any | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [groupMessages, setGroupMessages] = useState<any[]>([]);
  const [channelMessages, setChannelMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<Set<number>>(new Set());
  const [peer, setPeer] = useState<Peer | null>(null);
  const [currentCall, setCurrentCall] = useState<any>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [incomingCall, setIncomingCall] = useState<{ call: any; from: string } | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [showEmoji, setShowEmoji] = useState(false);
  const [showAttachment, setShowAttachment] = useState(false);
  const [showStickers, setShowStickers] = useState(false);
  const [showStickerManager, setShowStickerManager] = useState(false);
  const [showStickerPack, setShowStickerPack] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [deviceType, setDeviceType] = useState<'phone' | 'tablet' | 'desktop'>('desktop');
  const [refreshContacts, setRefreshContacts] = useState(0);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [unreadCounts, setUnreadCounts] = useState<Record<number, number>>({});
  const [lastMessageTimes, setLastMessageTimes] = useState<Record<number, string>>({});
  const [showGroupCreator, setShowGroupCreator] = useState(false);
  const [showChannelCreator, setShowChannelCreator] = useState(false);
  const [channelSubscribersCount, setChannelSubscribersCount] = useState<number>(0);

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');
  const isAdmin = currentUser.isAdmin === true;

  const scrollToBottom = () => { if (messagesEndRef.current) messagesEndRef.current.scrollIntoView({ behavior: 'smooth' }); };
  useEffect(() => { scrollToBottom(); }, [messages, groupMessages, channelMessages]);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width <= 480) setDeviceType('phone');
      else if (width <= 768) setDeviceType('tablet');
      else setDeviceType('desktop');
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  useEffect(() => { if (deviceType === 'phone' && (selectedUser || selectedGroup || selectedChannel)) setShowSidebar(false); else if (deviceType !== 'phone') setShowSidebar(true); }, [selectedUser, selectedGroup, selectedChannel, deviceType]);
  const handleBackToContacts = () => { setSelectedUser(null); setSelectedGroup(null); setSelectedChannel(null); setShowSidebar(true); };

  useEffect(() => {
    if (!token) return;
    axios.get(`${API_URL}/api/users`, { headers: { Authorization: `Bearer ${token}` } }).then(r => setUsers(r.data)).catch(console.error);
    axios.get(`${API_URL}/api/contacts`, { headers: { Authorization: `Bearer ${token}` } }).then(r => setContacts(r.data)).catch(console.error);
    axios.get(`${API_URL}/api/groups`, { headers: { Authorization: `Bearer ${token}` } }).then(r => setGroups(r.data)).catch(console.error);
    axios.get(`${API_URL}/api/channels`, { headers: { Authorization: `Bearer ${token}` } }).then(r => setChannels(r.data)).catch(console.error);
  }, [token, refreshContacts]);

  useEffect(() => {
    const newSocket = io(SOCKET_URL, { auth: { token }, transports: ['polling'] });
    setSocket(newSocket);
    newSocket.on('connect', () => console.log('Socket connected'));
    newSocket.on('private_message', (msg: Message) => {
      if (selectedUser && (msg.sender_id === selectedUser.id || msg.sender_id === currentUser.id)) {
        setMessages(prev => [...prev, msg]);
      } else if (msg.sender_id !== currentUser.id) {
        setUnreadCounts(prev => ({ ...prev, [msg.sender_id]: (prev[msg.sender_id] || 0) + 1 }));
        setLastMessageTimes(prev => ({ ...prev, [msg.sender_id]: msg.created_at }));
      }
    });
    newSocket.on('group_message', (msg: Message) => { if (selectedGroup && msg.group_id === selectedGroup.id) setGroupMessages(prev => [...prev, msg]); });
    newSocket.on('channel_message', (msg: Message) => { if (selectedChannel && msg.channel_id === selectedChannel.id) setChannelMessages(prev => [...prev, msg]); });
    newSocket.on('user_status', ({ userId, online }: { userId: number, online: boolean }) => {
      setOnlineUsers(prev => { const n = new Set(prev); online ? n.add(userId) : n.delete(userId); return n; });
    });
    newSocket.on('friend_request', ({ fromName }: { fromName: string }) => { alert(`Новая заявка от ${fromName}`); setRefreshContacts(p => p + 1); });
    newSocket.on('friend_request_accepted', ({ byName }: { byName: string }) => { alert(`${byName} принял заявку`); setRefreshContacts(p => p + 1); });
    newSocket.on('message_status', ({ receiverId, status }: { receiverId: number; status: string }) => {
      setMessages(prev => prev.map(msg => {
        if (msg.receiver_id === receiverId && msg.sender_id === currentUser.id && msg.status !== 'read') {
          return { ...msg, status };
        }
        return msg;
      }));
    });
    return () => { newSocket.disconnect(); };
  }, [token, currentUser.id, selectedUser, selectedGroup, selectedChannel]);

  useEffect(() => {
    const newPeer = new Peer(currentUser.id.toString(), {
      host: PEER_HOST, port: parseInt(PEER_PORT), path: PEER_PATH, secure: true,
    });
    setPeer(newPeer);
    newPeer.on('open', (id) => console.log('PeerJS:', id));
    newPeer.on('call', (call) => setIncomingCall({ call, from: call.peer }));
    return () => newPeer.destroy();
  }, [currentUser.id]);

  useEffect(() => {
    if (!selectedUser) return;
    axios.get(`${API_URL}/api/messages/${selectedUser.id}`, { headers: { Authorization: `Bearer ${token}` } }).then(r => {
      setMessages(r.data);
      setUnreadCounts(prev => ({ ...prev, [selectedUser.id]: 0 }));
      axios.put(`${API_URL}/api/messages/${selectedUser.id}/read`, {}, { headers: { Authorization: `Bearer ${token}` } }).catch(console.error);
    }).catch(console.error);
  }, [selectedUser, token]);

  useEffect(() => {
    if (!selectedGroup) return;
    axios.get(`${API_URL}/api/groups/${selectedGroup.id}/messages`, { headers: { Authorization: `Bearer ${token}` } }).then(r => setGroupMessages(r.data)).catch(console.error);
  }, [selectedGroup, token]);

  useEffect(() => {
    if (!selectedChannel) return;
    axios.get(`${API_URL}/api/channels/${selectedChannel.id}/messages`, { headers: { Authorization: `Bearer ${token}` } }).then(r => setChannelMessages(r.data)).catch(console.error);
    axios.get(`${API_URL}/api/channels/${selectedChannel.id}/subscribers`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setChannelSubscribersCount(r.data.count)).catch(console.error);
  }, [selectedChannel, token]);

  const sendMessage = (extra?: { image?: string; audio?: string }) => {
    if (!socket) return;
    const text = input.trim();
    if (!text && !extra) return;
    if (selectedUser) socket.emit('private_message', { to: selectedUser.id, text, ...extra });
    else if (selectedGroup) socket.emit('group_message', { groupId: selectedGroup.id, text, ...extra });
    else if (selectedChannel) {
      socket.emit('channel_message', { channelId: selectedChannel.id, text, ...extra });
    }
    setInput(''); setShowEmoji(false);
  };

  const copyChannelInviteLink = () => {
    if (!selectedChannel) return;
    const link = `${window.location.origin}/#/channel/${selectedChannel.id}`;
    navigator.clipboard.writeText(link).then(() => alert('Ссылка скопирована!')).catch(() => prompt('Скопируйте ссылку вручную:', link));
  };

  const startCall = async () => {
    if (!peer || (!selectedUser && !selectedGroup)) return;
    let stream: MediaStream | null = null;
    try { stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true }); }
    catch { try { stream = await navigator.mediaDevices.getUserMedia({ audio: true }); } catch { alert('Нет доступа к микрофону/камере. Звонок будет без медиа.'); } }
    if (stream) { setLocalStream(stream); setAudioEnabled(true); setVideoEnabled(true); }
    const targetId = selectedUser ? selectedUser.id.toString() : `group_${selectedGroup?.id}`;
    const call = peer.call(targetId, stream || undefined);
    if (call) { setCurrentCall(call); call.on('stream', (rs: MediaStream) => setRemoteStream(rs)); call.on('close', () => { setCurrentCall(null); stopLocalStream(); }); }
  };

  const acceptCall = async () => {
    if (!incomingCall) return;
    let stream: MediaStream | null = null;
    try { stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true }); }
    catch { try { stream = await navigator.mediaDevices.getUserMedia({ audio: true }); } catch { alert('Нет доступа к микрофону'); } }
    if (stream) { setLocalStream(stream); setAudioEnabled(true); setVideoEnabled(true); }
    incomingCall.call.answer(stream || undefined);
    setCurrentCall(incomingCall.call);
    incomingCall.call.on('stream', (rs: MediaStream) => setRemoteStream(rs));
    incomingCall.call.on('close', () => { setCurrentCall(null); stopLocalStream(); });
    setIncomingCall(null);
  };

  const declineCall = () => { if (incomingCall) { incomingCall.call.close(); setIncomingCall(null); } };
  const hangUp = () => { if (currentCall) { currentCall.close(); setCurrentCall(null); } stopLocalStream(); };
  const stopLocalStream = () => { if (localStream) { localStream.getTracks().forEach(t => t.stop()); setLocalStream(null); } if (screenStream) { screenStream.getTracks().forEach(t => t.stop()); setScreenStream(null); } setRemoteStream(null); };
  const onShareScreen = async () => { /* реализация по желанию */ };

  const addContact = (userId: number) => { axios.post(`${API_URL}/api/contacts`, { contactId: userId }, { headers: { Authorization: `Bearer ${token}` } }).then(() => { const u = users.find(u => u.id === userId); if (u) setContacts(prev => [...prev, u]); }).catch(console.error); };
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; if (!f) return; const reader = new FileReader(); reader.onload = () => sendMessage({ image: reader.result as string }); reader.readAsDataURL(f); if (fileInputRef.current) fileInputRef.current.value = ''; };
  const startRecording = async () => { try { const stream = await navigator.mediaDevices.getUserMedia({ audio: true }); const recorder = new MediaRecorder(stream); const chunks: Blob[] = []; recorder.ondataavailable = e => chunks.push(e.data); recorder.onstop = () => { const blob = new Blob(chunks, { type: 'audio/webm' }); const reader = new FileReader(); reader.onload = () => sendMessage({ audio: reader.result as string }); reader.readAsDataURL(blob); stream.getTracks().forEach(t => t.stop()); }; recorder.start(); setMediaRecorder(recorder); setRecording(true); } catch { alert('Нет микрофона'); } };
  const stopRecording = () => { mediaRecorder?.stop(); setRecording(false); };

  const stickers = ['😊', '😂', '😍', '👍', '🎉', '🔥', '❤️', '💯'];
  const sendSticker = (url: string) => { sendMessage({ image: url }); setShowStickers(false); setShowStickerManager(false); setShowStickerPack(false); };

  const displayedContacts = [...contacts].sort((a, b) => {
    const unreadA = unreadCounts[a.id] || 0;
    const unreadB = unreadCounts[b.id] || 0;
    if (unreadA > 0 && unreadB === 0) return -1;
    if (unreadB > 0 && unreadA === 0) return 1;
    const timeA = lastMessageTimes[a.id] || '';
    const timeB = lastMessageTimes[b.id] || '';
    if (timeA && timeB) return timeB.localeCompare(timeA);
    if (timeA && !timeB) return -1;
    if (!timeA && timeB) return 1;
    return a.username.localeCompare(b.username);
  });

  return (
    <div style={styles.container}>
      <UpdateBanner />
      {incomingCall && !currentCall && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000,
        }}>
          <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} style={{
            background: 'var(--sidebar-bg)', padding: 30, borderRadius: 24,
            textAlign: 'center',
          }}>
            <h3>📞 Входящий звонок</h3>
            <p>{incomingCall.from}</p>
            <button onClick={acceptCall} style={{ marginRight: 16, padding: '10px 24px', borderRadius: 40, background: '#4caf50', color: 'white', border: 'none' }}>Принять</button>
            <button onClick={declineCall} style={{ padding: '10px 24px', borderRadius: 40, background: '#f44336', color: 'white', border: 'none' }}>Отклонить</button>
          </motion.div>
        </motion.div>
      )}
      {currentCall && (
        <CallWindow
          localStream={localStream} remoteStream={remoteStream} onHangUp={hangUp}
          onToggleAudio={() => { if (localStream) { localStream.getAudioTracks().forEach(t => t.enabled = !t.enabled); setAudioEnabled(prev => !prev); } }}
          onToggleVideo={() => { if (localStream) { localStream.getVideoTracks().forEach(t => t.enabled = !t.enabled); setVideoEnabled(prev => !prev); } }}
          onShareScreen={onShareScreen} audioEnabled={audioEnabled} videoEnabled={videoEnabled} screenStream={screenStream}
          localAvatar={currentUser.avatar || localStorage.getItem('avatar')} remoteAvatar={selectedUser?.avatar}
        />
      )}

      {(showSidebar || deviceType !== 'phone') && (
        <motion.div initial={deviceType === 'phone' ? { x: -300 } : false} animate={{ x: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          style={{ ...styles.sidebar, ...(deviceType === 'phone' && { position: 'absolute', zIndex: 20, height: '100%', width: '100%', maxWidth: '100%' }) }}>
          <div style={styles.sidebarHeader}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={styles.sidebarTitle}>💬 CBEF</h2>
              <div style={{ display: 'flex', gap: 8 }}>
                {isAdmin && <button onClick={() => setShowAdmin(true)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer' }} title="Админ-панель">🛡️</button>}
                <button onClick={() => setShowAddFriend(true)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer' }}>👤+</button>
                <button onClick={() => setShowGroupCreator(true)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer' }}>👥</button>
                <button onClick={() => setShowChannelCreator(true)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer' }}>📢</button>
              </div>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: 14, color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
              <span>{currentUser.username}</span>
              <button onClick={() => window.location.hash = '#/settings'} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: 'var(--text-secondary)' }}>⚙️</button>
            </p>
          </div>
          <FriendRequests token={token!} onAccept={() => setRefreshContacts(prev => prev + 1)} />
          <div style={styles.contactList}>
            {displayedContacts.map(user => (
              <div key={user.id} style={{ ...styles.contactItem, backgroundColor: selectedUser?.id === user.id ? 'var(--hover-bg)' : 'transparent' }} onClick={() => { setSelectedUser(user); setSelectedGroup(null); setSelectedChannel(null); }}>
                <div style={styles.contactInfo}>
                  <span style={onlineUsers.has(user.id) ? styles.onlineDot : styles.offlineDot} />
                  <Avatar src={user.avatar} name={user.username} size={40} />
                  <span style={styles.contactName}>{user.username}</span>
                  {unreadCounts[user.id] > 0 && <div style={styles.badge}>{unreadCounts[user.id]}</div>}
                </div>
              </div>
            ))}
            {groups.map(group => (
              <div key={group.id} style={{ ...styles.contactItem, backgroundColor: selectedGroup?.id === group.id ? 'var(--hover-bg)' : 'transparent' }} onClick={() => { setSelectedGroup(group); setSelectedUser(null); setSelectedChannel(null); }}>
                <div style={styles.contactInfo}><span style={{ fontSize: 20 }}>👥</span><span style={styles.contactName}>{group.name}</span></div>
              </div>
            ))}
            {channels.map(channel => (
              <div key={channel.id} style={{ ...styles.contactItem, backgroundColor: selectedChannel?.id === channel.id ? 'var(--hover-bg)' : 'transparent' }} onClick={() => { setSelectedChannel(channel); setSelectedUser(null); setSelectedGroup(null); }}>
                <div style={styles.contactInfo}><span style={{ fontSize: 20 }}>📢</span><span style={styles.contactName}>{channel.name}</span></div>
              </div>
            ))}
            <div style={{ ...styles.contactItem, justifyContent: 'center', color: 'var(--text-secondary)' }} onClick={() => alert('Создание ботов скоро появится!')}>
              <span>🤖 Создать бота</span>
            </div>
          </div>
        </motion.div>
      )}

      <div style={{ ...styles.chatArea, ...(deviceType === 'phone' && !showSidebar ? { display: 'flex' } : { display: deviceType === 'phone' ? 'none' : 'flex' }) }}>
        {selectedUser || selectedGroup || selectedChannel ? (
          <>
            <div style={styles.chatHeader}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {deviceType === 'phone' && <button style={styles.backButton} onClick={handleBackToContacts}>←</button>}
                <h3 style={styles.chatHeaderTitle}>
                  {selectedUser ? selectedUser.username : selectedGroup?.name || selectedChannel?.name}
                  {selectedUser && <span style={{ marginLeft: 8, fontSize: 14, fontWeight: 400 }}>{onlineUsers.has(selectedUser.id) ? '🟢 онлайн' : '⚫ офлайн'}</span>}
                  {selectedChannel && <span style={{ marginLeft: 8, fontSize: 14, fontWeight: 400, color: 'var(--text-secondary)' }}>{channelSubscribersCount} подписчиков</span>}
                </h3>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {selectedChannel && (
                  <button onClick={copyChannelInviteLink} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }} title="Пригласить">📎</button>
                )}
                {!currentCall ? <button style={styles.callButton} onClick={startCall}>📞 Видеозвонок</button> : <button style={styles.hangUpButton} onClick={hangUp}>❌ Завершить</button>}
              </div>
            </div>
            <div style={styles.messagesContainer}>
              <AnimatePresence>
                {(selectedUser ? messages : selectedGroup ? groupMessages : channelMessages).map(msg => (
                  <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} style={{ ...styles.messageRow, justifyContent: msg.sender_id === currentUser.id ? 'flex-end' : 'flex-start' }}>
                    {msg.sender_id !== currentUser.id && <Avatar src={selectedUser?.avatar} name={selectedUser?.username} size={32} />}
                    <div style={{ ...styles.messageBubble, ...(msg.sender_id === currentUser.id ? styles.messageOwn : styles.messageOther) }}>
                      {msg.image && <img src={msg.image} alt="sent" style={{ maxWidth: '128px', maxHeight: '128px', borderRadius: 12, marginBottom: 4 }} />}
                      {msg.audio && <audio controls src={msg.audio} style={{ maxWidth: 200 }} />}
                      {msg.text}
                      {msg.status && (
                        <span style={{ fontSize: 12, marginLeft: 8, opacity: 0.7 }}>
                          {msg.status === 'sent' && '✓'}
                          {msg.status === 'delivered' && '✓✓'}
                          {msg.status === 'read' && <span style={{ color: '#4a9eff' }}>✓✓</span>}
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>
            <div style={styles.inputContainer}>
              <input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }} onChange={handleImageUpload} />
              <button style={styles.iconButton} onClick={() => setShowAttachment(!showAttachment)}>📎</button>
              {showAttachment && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={styles.attachmentMenu}>
                  <button style={styles.iconButton} onClick={() => fileInputRef.current?.click()}>🖼️</button>
                  <button style={styles.iconButton} onClick={() => setShowStickerPack(true)}>📦</button>
                  <button style={styles.iconButton} onClick={() => setShowStickers(!showStickers)}>😀</button>
                  <button style={styles.iconButton} onClick={() => setShowStickerManager(true)}>🖼️+</button>
                  {recording ? <button style={styles.iconButton} onClick={stopRecording}>⏹️</button> : <button style={styles.iconButton} onClick={startRecording}>🎤</button>}
                </motion.div>
              )}
              <button style={styles.iconButton} onClick={() => setShowEmoji(!showEmoji)}>😊</button>
              <input style={styles.input} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} placeholder="Сообщение" />
              <button style={styles.sendButton} onClick={() => sendMessage()}>Отправить</button>
            </div>
            {showEmoji && <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ position: 'absolute', bottom: 90, right: 20, zIndex: 30 }}><EmojiPicker onEmojiClick={(e) => setInput(prev => prev + e.emoji)} /></motion.div>}
            {showStickers && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ ...styles.attachmentMenu, bottom: 130 }}>
                <div style={styles.stickerGrid}>
                  {stickers.map(s => <div key={s} style={styles.sticker} onClick={() => sendSticker(s)}>{s}</div>)}
                </div>
              </motion.div>
            )}
            {showStickerManager && <StickerManager onSendSticker={(url) => { sendMessage({ image: url }); setShowStickerManager(false); }} onClose={() => setShowStickerManager(false)} />}
            {showStickerPack && <StickerPackViewer onSelectSticker={(url) => { sendMessage({ image: url }); setShowStickerPack(false); }} onClose={() => setShowStickerPack(false)} />}
          </>
        ) : (
          <div style={styles.emptyChat}>Выберите контакт, группу или канал</div>
        )}
      </div>
      <audio ref={remoteAudioRef} autoPlay />
      {showAddFriend && <AddFriend token={token!} onClose={() => setShowAddFriend(false)} />}
      {showGroupCreator && <GroupCreator token={token!} onClose={() => setShowGroupCreator(false)} onCreated={() => setRefreshContacts(prev => prev + 1)} />}
      {showChannelCreator && <ChannelCreator token={token!} onClose={() => setShowChannelCreator(false)} onCreated={() => setRefreshContacts(prev => prev + 1)} />}
      {showAdmin && <AdminPanel token={token!} onClose={() => setShowAdmin(false)} />}
    </div>
  );
}