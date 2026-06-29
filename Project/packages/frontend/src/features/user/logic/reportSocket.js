import io from 'socket.io-client';

const getSocketUrl = () => import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

export const createParentReportSocket = ({ onActivity, onMilestone, onConnectChange }) => {
  const socket = io(getSocketUrl(), {
    transports: ['websocket', 'polling'],
  });

  socket.on('connect', () => {
    onConnectChange?.(true);
  });

  socket.on('disconnect', () => {
    onConnectChange?.(false);
  });

  socket.on('connect_error', () => {
    onConnectChange?.(false);
  });

  socket.on('child-activity', (data) => {
    onActivity?.(data);
  });

  socket.on('gamification-milestone', (data) => {
    onMilestone?.(data);
  });

  return socket;
};
