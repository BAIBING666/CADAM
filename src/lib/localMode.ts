import type { AppUIMessage } from '@shared/chatAi';
import type { Conversation, Message } from '@shared/types';

export const isLocalMode = import.meta.env.VITE_LOCAL_MODE === 'true';
export const LOCAL_USER_ID = '00000000-0000-4000-8000-000000000001';
export const LOCAL_USER_EMAIL = 'admin@local.cadam';

const CONVERSATIONS_KEY = 'cadam.local.conversations';
const MESSAGES_KEY = 'cadam.local.messages';
export const LOCAL_SESSION_KEY = 'cadam.local.authenticated';

function read<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function listLocalConversations(): Conversation[] {
  return read<Conversation[]>(CONVERSATIONS_KEY, []);
}

export function getLocalConversation(id: string): Conversation | undefined {
  return listLocalConversations().find((item) => item.id === id);
}

export function saveLocalConversation(conversation: Conversation) {
  const conversations = listLocalConversations();
  const index = conversations.findIndex((item) => item.id === conversation.id);
  if (index >= 0) conversations[index] = conversation;
  else conversations.unshift(conversation);
  write(CONVERSATIONS_KEY, conversations);
  return conversation;
}

export function createLocalConversation({
  id,
  type,
  model,
  title,
}: {
  id: string;
  type: Conversation['type'];
  model: string;
  title: string;
}): Conversation {
  const now = new Date().toISOString();
  return saveLocalConversation({
    id,
    title,
    current_message_leaf_id: null,
    user_id: LOCAL_USER_ID,
    created_at: now,
    updated_at: now,
    privacy: 'private',
    type,
    settings: { model },
  });
}

export function updateLocalConversation(
  id: string,
  updates: Partial<Conversation>,
): Conversation {
  const current = getLocalConversation(id);
  if (!current) throw new Error('Local conversation not found');
  return saveLocalConversation({
    ...current,
    ...updates,
    updated_at: new Date().toISOString(),
  });
}

export function listLocalMessages(conversationId: string): Message[] {
  return (
    read<Record<string, Message[]>>(MESSAGES_KEY, {})[conversationId] ?? []
  );
}

export function saveLocalMessage(
  conversationId: string,
  message: Message,
): Message {
  const all = read<Record<string, Message[]>>(MESSAGES_KEY, {});
  const messages = all[conversationId] ?? [];
  const index = messages.findIndex((item) => item.id === message.id);
  if (index >= 0) messages[index] = message;
  else messages.push(message);
  all[conversationId] = messages;
  write(MESSAGES_KEY, all);
  updateLocalConversation(conversationId, {
    current_message_leaf_id: message.id,
  });
  return message;
}

export function saveLocalUiMessage(
  conversationId: string,
  message: AppUIMessage,
  parentMessageId: string | null,
): Message {
  return saveLocalMessage(conversationId, {
    id: message.id,
    conversation_id: conversationId,
    role: message.role === 'user' ? 'user' : 'assistant',
    parts: message.parts,
    metadata: message.metadata ?? {},
    parent_message_id: parentMessageId,
    rating: 0,
    created_at: new Date().toISOString(),
  });
}

export function deleteLocalConversation(id: string) {
  write(
    CONVERSATIONS_KEY,
    listLocalConversations().filter((item) => item.id !== id),
  );
  const all = read<Record<string, Message[]>>(MESSAGES_KEY, {});
  delete all[id];
  write(MESSAGES_KEY, all);
}
