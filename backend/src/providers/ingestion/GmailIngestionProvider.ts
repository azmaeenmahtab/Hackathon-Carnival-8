import { IngestionProvider, RawThread } from "./IngestionProvider.js";

/**
 * Phase 2 Stub: Gmail Ingestion Provider
 * When activated with Gmail OAuth, this class will query the Gmail API (users.threads.list/get)
 * and normalize the threads into RawThread objects.
 */
export class GmailIngestionProvider implements IngestionProvider {
  name = "gmail";

  async fetchThreads(_userId: string): Promise<RawThread[]> {
    throw new Error(
      "Gmail ingestion is scheduled for Phase 2. Please use the mock ingestion provider."
    );
  }
}
