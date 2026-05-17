// ----------API DO SMART ASSIST (IA)----------
import { apiClient } from './client';
import type { SmartAssistRequest, SmartAssistResponse } from '../types/ai';

export async function generateSmartAssist(payload: SmartAssistRequest) {
  const { data } = await apiClient.post<SmartAssistResponse>('/ai/smart-assist', payload);
  return data;
}
