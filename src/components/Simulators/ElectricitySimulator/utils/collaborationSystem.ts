import { Component, Connection } from '../types/circuit';

export interface User {
  id: string;
  name: string;
  color: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen: Date;
  cursor?: {
    x: number;
    y: number;
  };
}

export interface CollaborationSession {
  id: string;
  name: string;
  owner: string;
  participants: User[];
  isActive: boolean;
  createdAt: Date;
  lastActivity: Date;
}

export interface CollaborationEvent {
  id: string;
  type: 'component_added' | 'component_removed' | 'component_updated' | 'connection_added' | 'connection_removed' | 'cursor_moved' | 'user_joined' | 'user_left' | 'chat_message';
  userId: string;
  timestamp: Date;
  data: any;
}

export interface ConflictResolution {
  id: string;
  type: 'component_conflict' | 'connection_conflict' | 'property_conflict';
  description: string;
  options: ConflictOption[];
  resolvedBy?: string;
  resolvedAt?: Date;
  resolution?: ConflictOption;
}

export interface ConflictOption {
  id: string;
  description: string;
  data: any;
  userId: string;
}

export class CollaborationSystem {
  private ws: WebSocket | null = null;
  private session: CollaborationSession | null = null;
  private currentUser: User | null = null;
  private participants: Map<string, User> = new Map();
  private eventHistory: CollaborationEvent[] = [];
  private conflicts: Map<string, ConflictResolution> = new Map();
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 1000;

  // Event callbacks
  private onUserJoinedCallback?: (user: User) => void;
  private onUserLeftCallback?: (userId: string) => void;
  private onComponentAddedCallback?: (component: Component, userId: string) => void;
  private onComponentRemovedCallback?: (componentId: string, userId: string) => void;
  private onComponentUpdatedCallback?: (component: Component, userId: string) => void;
  private onConnectionAddedCallback?: (connection: Connection, userId: string) => void;
  private onConnectionRemovedCallback?: (connectionId: string, userId: string) => void;
  private onCursorMovedCallback?: (userId: string, cursor: { x: number; y: number }) => void;
  private onChatMessageCallback?: (message: string, userId: string) => void;
  private onConflictDetectedCallback?: (conflict: ConflictResolution) => void;
  private onConflictResolvedCallback?: (conflictId: string, resolution: ConflictOption) => void;

  constructor() {
    this.setupEventListeners();
  }

  /**
   * Connect to collaboration server
   */
  async connect(serverUrl: string, user: User, sessionId?: string): Promise<boolean> {
    try {
      this.currentUser = user;
      this.ws = new WebSocket(serverUrl);

      return new Promise((resolve, reject) => {
        if (!this.ws) {
          reject(new Error('WebSocket connection failed'));
          return;
        }

        this.ws.onopen = () => {
          this.isConnected = true;
          this.reconnectAttempts = 0;
          
          // Join session
          this.sendEvent({
            type: 'user_joined',
            userId: user.id,
            timestamp: new Date(),
            data: { user, sessionId }
          });

          resolve(true);
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event);
        };

        this.ws.onclose = () => {
          this.isConnected = false;
          this.handleDisconnection();
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };
      });
    } catch (error) {
      console.error('Failed to connect to collaboration server:', error);
      return false;
    }
  }

  /**
   * Disconnect from collaboration server
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
    this.session = null;
    this.participants.clear();
  }

  /**
   * Create a new collaboration session
   */
  createSession(name: string): CollaborationSession {
    const session: CollaborationSession = {
      id: this.generateId(),
      name,
      owner: this.currentUser?.id || '',
      participants: [],
      isActive: true,
      createdAt: new Date(),
      lastActivity: new Date()
    };

    this.session = session;
    return session;
  }

  /**
   * Join an existing collaboration session
   */
  joinSession(sessionId: string): void {
    if (this.isConnected && this.currentUser) {
      this.sendEvent({
        type: 'user_joined',
        userId: this.currentUser.id,
        timestamp: new Date(),
        data: { sessionId, user: this.currentUser }
      });
    }
  }

  /**
   * Leave the current collaboration session
   */
  leaveSession(): void {
    if (this.isConnected && this.currentUser) {
      this.sendEvent({
        type: 'user_left',
        userId: this.currentUser.id,
        timestamp: new Date(),
        data: { sessionId: this.session?.id }
      });
    }
  }

  /**
   * Add a component to the shared circuit
   */
  addComponent(component: Component): void {
    if (this.isConnected && this.currentUser) {
      this.sendEvent({
        type: 'component_added',
        userId: this.currentUser.id,
        timestamp: new Date(),
        data: { component }
      });
    }
  }

  /**
   * Remove a component from the shared circuit
   */
  removeComponent(componentId: string): void {
    if (this.isConnected && this.currentUser) {
      this.sendEvent({
        type: 'component_removed',
        userId: this.currentUser.id,
        timestamp: new Date(),
        data: { componentId }
      });
    }
  }

  /**
   * Update a component in the shared circuit
   */
  updateComponent(component: Component): void {
    if (this.isConnected && this.currentUser) {
      this.sendEvent({
        type: 'component_updated',
        userId: this.currentUser.id,
        timestamp: new Date(),
        data: { component }
      });
    }
  }

  /**
   * Add a connection to the shared circuit
   */
  addConnection(connection: Connection): void {
    if (this.isConnected && this.currentUser) {
      this.sendEvent({
        type: 'connection_added',
        userId: this.currentUser.id,
        timestamp: new Date(),
        data: { connection }
      });
    }
  }

  /**
   * Remove a connection from the shared circuit
   */
  removeConnection(connectionId: string): void {
    if (this.isConnected && this.currentUser) {
      this.sendEvent({
        type: 'connection_removed',
        userId: this.currentUser.id,
        timestamp: new Date(),
        data: { connectionId }
      });
    }
  }

  /**
   * Update cursor position
   */
  updateCursor(x: number, y: number): void {
    if (this.isConnected && this.currentUser) {
      this.sendEvent({
        type: 'cursor_moved',
        userId: this.currentUser.id,
        timestamp: new Date(),
        data: { x, y }
      });
    }
  }

  /**
   * Send a chat message
   */
  sendChatMessage(message: string): void {
    if (this.isConnected && this.currentUser) {
      this.sendEvent({
        type: 'chat_message',
        userId: this.currentUser.id,
        timestamp: new Date(),
        data: { message }
      });
    }
  }

  /**
   * Resolve a conflict
   */
  resolveConflict(conflictId: string, resolution: ConflictOption): void {
    if (this.isConnected && this.currentUser) {
      const conflict = this.conflicts.get(conflictId);
      if (conflict) {
        conflict.resolvedBy = this.currentUser.id;
        conflict.resolvedAt = new Date();
        conflict.resolution = resolution;
        
        this.sendEvent({
          type: 'conflict_resolved',
          userId: this.currentUser.id,
          timestamp: new Date(),
          data: { conflictId, resolution }
        });

        this.onConflictResolvedCallback?.(conflictId, resolution);
      }
    }
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(event: MessageEvent): void {
    try {
      const data = JSON.parse(event.data);
      const eventData: CollaborationEvent = data;

      this.eventHistory.push(eventData);

      switch (eventData.type) {
        case 'user_joined':
          this.handleUserJoined(eventData);
          break;
        case 'user_left':
          this.handleUserLeft(eventData);
          break;
        case 'component_added':
          this.handleComponentAdded(eventData);
          break;
        case 'component_removed':
          this.handleComponentRemoved(eventData);
          break;
        case 'component_updated':
          this.handleComponentUpdated(eventData);
          break;
        case 'connection_added':
          this.handleConnectionAdded(eventData);
          break;
        case 'connection_removed':
          this.handleConnectionRemoved(eventData);
          break;
        case 'cursor_moved':
          this.handleCursorMoved(eventData);
          break;
        case 'chat_message':
          this.handleChatMessage(eventData);
          break;
        case 'conflict_detected':
          this.handleConflictDetected(eventData);
          break;
        case 'conflict_resolved':
          this.handleConflictResolved(eventData);
          break;
      }
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  }

  /**
   * Handle user joined event
   */
  private handleUserJoined(event: CollaborationEvent): void {
    const user: User = event.data.user;
    this.participants.set(user.id, user);
    this.onUserJoinedCallback?.(user);
  }

  /**
   * Handle user left event
   */
  private handleUserLeft(event: CollaborationEvent): void {
    const userId = event.userId;
    this.participants.delete(userId);
    this.onUserLeftCallback?.(userId);
  }

  /**
   * Handle component added event
   */
  private handleComponentAdded(event: CollaborationEvent): void {
    const component: Component = event.data.component;
    this.onComponentAddedCallback?.(component, event.userId);
  }

  /**
   * Handle component removed event
   */
  private handleComponentRemoved(event: CollaborationEvent): void {
    const componentId = event.data.componentId;
    this.onComponentRemovedCallback?.(componentId, event.userId);
  }

  /**
   * Handle component updated event
   */
  private handleComponentUpdated(event: CollaborationEvent): void {
    const component: Component = event.data.component;
    this.onComponentUpdatedCallback?.(component, event.userId);
  }

  /**
   * Handle connection added event
   */
  private handleConnectionAdded(event: CollaborationEvent): void {
    const connection: Connection = event.data.connection;
    this.onConnectionAddedCallback?.(connection, event.userId);
  }

  /**
   * Handle connection removed event
   */
  private handleConnectionRemoved(event: CollaborationEvent): void {
    const connectionId = event.data.connectionId;
    this.onConnectionRemovedCallback?.(connectionId, event.userId);
  }

  /**
   * Handle cursor moved event
   */
  private handleCursorMoved(event: CollaborationEvent): void {
    const cursor = event.data;
    this.onCursorMovedCallback?.(event.userId, cursor);
  }

  /**
   * Handle chat message event
   */
  private handleChatMessage(event: CollaborationEvent): void {
    const message = event.data.message;
    this.onChatMessageCallback?.(message, event.userId);
  }

  /**
   * Handle conflict detected event
   */
  private handleConflictDetected(event: CollaborationEvent): void {
    const conflict: ConflictResolution = event.data.conflict;
    this.conflicts.set(conflict.id, conflict);
    this.onConflictDetectedCallback?.(conflict);
  }

  /**
   * Handle conflict resolved event
   */
  private handleConflictResolved(event: CollaborationEvent): void {
    const { conflictId, resolution } = event.data;
    this.onConflictResolvedCallback?.(conflictId, resolution);
  }

  /**
   * Handle disconnection
   */
  private handleDisconnection(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        this.reconnect();
      }, this.reconnectDelay * this.reconnectAttempts);
    }
  }

  /**
   * Attempt to reconnect
   */
  private reconnect(): void {
    // This would attempt to reconnect to the server
    console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
  }

  /**
   * Send event to server
   */
  private sendEvent(event: CollaborationEvent): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(event));
    }
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    // Handle page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.updateUserStatus('away');
      } else {
        this.updateUserStatus('online');
      }
    });

    // Handle window beforeunload
    window.addEventListener('beforeunload', () => {
      this.leaveSession();
    });
  }

  /**
   * Update user status
   */
  private updateUserStatus(status: 'online' | 'away' | 'offline'): void {
    if (this.isConnected && this.currentUser) {
      this.sendEvent({
        type: 'user_status_changed',
        userId: this.currentUser.id,
        timestamp: new Date(),
        data: { status }
      });
    }
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  /**
   * Set event callbacks
   */
  setOnUserJoined(callback: (user: User) => void): void {
    this.onUserJoinedCallback = callback;
  }

  setOnUserLeft(callback: (userId: string) => void): void {
    this.onUserLeftCallback = callback;
  }

  setOnComponentAdded(callback: (component: Component, userId: string) => void): void {
    this.onComponentAddedCallback = callback;
  }

  setOnComponentRemoved(callback: (componentId: string, userId: string) => void): void {
    this.onComponentRemovedCallback = callback;
  }

  setOnComponentUpdated(callback: (component: Component, userId: string) => void): void {
    this.onComponentUpdatedCallback = callback;
  }

  setOnConnectionAdded(callback: (connection: Connection, userId: string) => void): void {
    this.onConnectionAddedCallback = callback;
  }

  setOnConnectionRemoved(callback: (connectionId: string, userId: string) => void): void {
    this.onConnectionRemovedCallback = callback;
  }

  setOnCursorMoved(callback: (userId: string, cursor: { x: number; y: number }) => void): void {
    this.onCursorMovedCallback = callback;
  }

  setOnChatMessage(callback: (message: string, userId: string) => void): void {
    this.onChatMessageCallback = callback;
  }

  setOnConflictDetected(callback: (conflict: ConflictResolution) => void): void {
    this.onConflictDetectedCallback = callback;
  }

  setOnConflictResolved(callback: (conflictId: string, resolution: ConflictOption) => void): void {
    this.onConflictResolvedCallback = callback;
  }

  /**
   * Get current session
   */
  getSession(): CollaborationSession | null {
    return this.session;
  }

  /**
   * Get participants
   */
  getParticipants(): User[] {
    return Array.from(this.participants.values());
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  /**
   * Get connection status
   */
  isConnectedToServer(): boolean {
    return this.isConnected;
  }

  /**
   * Get event history
   */
  getEventHistory(): CollaborationEvent[] {
    return [...this.eventHistory];
  }

  /**
   * Get active conflicts
   */
  getActiveConflicts(): ConflictResolution[] {
    return Array.from(this.conflicts.values()).filter(c => !c.resolvedAt);
  }
}

// Global collaboration system instance
export const collaborationSystem = new CollaborationSystem();
