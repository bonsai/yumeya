export type ApiResponse = {
  message: string;
  success: boolean;
}

export type Dream = {
  id: number;
  userId: string;
  rawText: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  createdAt: string;
}

export type Fabric = {
  id: number;
  dreamId: number;
  xmlContent: string;
  createdAt: string;
}

export type CreateDreamRequest = {
  userId: string;
  rawText: string;
}
