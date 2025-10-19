interface ManusSession {
    taskId: string;
    taskUrl: string;
    chatId: number;
    userId: number;
    createdAt: Date;
}
declare class SessionStorage {
    private sessions;
    setSession(chatId: number, session: Omit<ManusSession, 'chatId'>): void;
    getSession(chatId: number): ManusSession | undefined;
    clearSession(chatId: number): void;
    cleanupOldSessions(): void;
    getAllSessions(): ManusSession[];
}
export declare const sessionStorage: SessionStorage;
export {};
//# sourceMappingURL=session.d.ts.map