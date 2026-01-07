
export type ViewType = 'dashboard' | 'documents' | 'projects' | 'whiteboard' | 'chat' | 'files' | 'settings';

export interface User {
  id: string;
  name: string;
  avatar: string;
  role: 'Admin' | 'Member' | 'Viewer';
  status: 'online' | 'offline' | 'away';
}

export type ElementType = 'rect' | 'circle' | 'text';

export interface CanvasElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  text?: string;
  stroke?: string;
}

export interface Document {
  id: string;
  title: string;
  content: string;
  lastEditedBy: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
  assignee: string;
  priority: 'low' | 'medium' | 'high';
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
}

export interface SharedFile {
  id: string;
  name: string;
  size: string;
  type: string;
  uploadedBy: string;
  uploadedAt: string;
}
