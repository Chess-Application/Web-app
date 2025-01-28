function useWebSocket(url, onMessage, onError) {
	const websocket = new WebSocket(url);

	websocket.onmessage = onMessage
	websocket.onerror = onError;

	return websocket;
}