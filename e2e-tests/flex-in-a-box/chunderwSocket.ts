import { RawData, WebSocket } from 'ws';

export const chunderwSocket = (websocket: WebSocket, initialMessage: RawData) => {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const processIncomingMessage = (data: RawData) => {
    const jsonMessage = JSON.stringify(decoder.decode(data as ArrayBuffer));
  };
  websocket.on('message', processIncomingMessage);
  processIncomingMessage(initialMessage);
};
