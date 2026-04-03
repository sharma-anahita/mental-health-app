import apiClient from './apiClient';

export interface SendChatMessagePayload {
  message: string;
  mood?: string;
}

export interface SendChatMessageResponse {
  response: string;
}

export async function sendChatMessage(payload: SendChatMessagePayload): Promise<SendChatMessageResponse> {
  return apiClient.post<SendChatMessageResponse>('chat', payload);
}

export default { sendChatMessage };
