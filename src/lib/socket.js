import { io } from 'socket.io-client'
import { tokens } from './api'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001'

let socket = null

export function getSocket() {
  if (socket?.connected) return socket
  if (socket) return socket

  const token = tokens.getAccess()
  if (!token) return null

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  })

  socket.on('connect_error', (err) => {
    // eslint-disable-next-line no-console
    console.warn('[socket] connect_error:', err.message)
  })

  return socket
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

// Rebind socket with latest access token (after refresh or login)
export function reconnectSocket() {
  disconnectSocket()
  return getSocket()
}
