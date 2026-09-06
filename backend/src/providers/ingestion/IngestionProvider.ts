export interface RawMessage {
  sender: string;
  senderIsFaculty: boolean;
  sentAt: Date;
  body: string;
}

export interface RawThread {
  externalThreadId: string;
  subject: string;
  participants: string[];
  messages: RawMessage[];
  lastMessageAt: Date;
  // Optional pre-annotated fields from mock source for rapid testing
  mockCategory?: string;
  mockUrgency?: string;
  mockActionNeeded?: boolean;
  mockDeadline?: Date | null;
  mockAiExplanation?: string;
  mockIsRead?: boolean;
}

export interface IngestionProvider {
  name: string;
  fetchThreads(userId: string): Promise<RawThread[]>;
}
