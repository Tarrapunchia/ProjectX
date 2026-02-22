export interface ClientInfo {
    socketId: string;
    socket: WebSocket;
    userId: Number;
    email?: string;
    connectedAt: Date;
    lastActivity: Date;
}
export interface Message {
    type: string;
    fromUserId: number;
    toUserId?: number;
    toRoom?: string;
    timestamp: Date;
    payload: unknown;
}
//# sourceMappingURL=types.d.ts.map