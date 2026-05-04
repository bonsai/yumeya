/**
 * Represents a standard API response.
 */
export type ApiResponse = {
  /** The message returned by the API */
  message: string;
  /** Indicates if the request was successful */
  success: boolean;
}

/**
 * Represents a dream record in the system.
 */
export type Dream = {
  /** Unique identifier for the dream */
  id: number;
  /** ID of the user who submitted the dream */
  userId: string;
  /** The raw text description of the dream */
  rawText: string;
  /** Current status of the dream processing */
  status: 'queued' | 'processing' | 'completed' | 'failed';
  /** Timestamp when the dream was created */
  createdAt: string;
}

/**
 * Represents a woven fabric (XML interpretation) of a dream.
 */
export type Fabric = {
  /** Unique identifier for the fabric */
  id: number;
  /** ID of the dream this fabric belongs to */
  dreamId: number;
  /** The generated XML content representing the dream interpretation */
  xmlContent: string;
  /** Timestamp when the fabric was created */
  createdAt: string;
}

/**
 * Payload for creating a new dream entry.
 */
export type CreateDreamRequest = {
  /** ID of the user submitting the dream */
  userId: string;
  /** Raw text description of the dream */
  rawText: string;
}
