import { request } from '@/utils/request'

export interface HomeChatRequest {
  question: string
  datasource_id?: number
  table_name?: string
  data?: string
}

export interface HomeChatResponse {
  success: boolean
  result?: any
  error?: string
  tool?: string
}

export const homeApi = {
  chat: (data: HomeChatRequest) => request.post('/home/chat', data),
}
