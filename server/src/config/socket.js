let io;

export function registerSocket(serverIo) {
  io = serverIo;
}

export function emitEvent(eventName, payload) {
  if (!io) return;
  io.emit(eventName, payload);
}
