// Simple in-memory session storage for Manus tasks
// In production, you might want to use Redis or a database

interface ManusSession {
  taskId: string;
  taskUrl: string;
  chatId: number;
  userId: number;
  createdAt: Date;
}

class SessionStorage {
  private sessions: Map<number, ManusSession> = new Map();

  // Store session by chat ID
  setSession(chatId: number, session: Omit<ManusSession, 'chatId'>): void {
    this.sessions.set(chatId, {
      ...session,
      chatId
    });
  }

  // Get session by chat ID
  getSession(chatId: number): ManusSession | undefined {
    return this.sessions.get(chatId);
  }

  // Clear session
  clearSession(chatId: number): void {
    this.sessions.delete(chatId);
  }

  // Clean up old sessions (older than 24 hours)
  cleanupOldSessions(): void {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    for (const [chatId, session] of this.sessions.entries()) {
      if (session.createdAt < oneDayAgo) {
        this.sessions.delete(chatId);
      }
    }
  }

  // Get all active sessions
  getAllSessions(): ManusSession[] {
    return Array.from(this.sessions.values());
  }
}

// Export singleton instance
export const sessionStorage = new SessionStorage();

// Clean up old sessions every hour
setInterval(() => {
  sessionStorage.cleanupOldSessions();
}, 60 * 60 * 1000);
