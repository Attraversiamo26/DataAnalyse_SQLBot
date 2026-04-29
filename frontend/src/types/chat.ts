// 对话消息类型
export enum MessageType {
  USER = 'user',
  SYSTEM = 'system'
}

// 分析类型
export enum AnalysisType {
  CHAT = 'chat',
  ANALYSIS = 'analysis',
  REPORT = 'report'
}

// 对话消息接口
export interface ChatMessage {
  id: string;           // 消息唯一标识符
  type: MessageType;    // 消息类型
  role: string;         // 消息角色 (user, assistant)
  content: string;      // 消息内容
  timestamp: number;    // 消息时间戳
  analysisType?: AnalysisType;  // 分析类型
  data?: any;           // 附加数据（如SQL结果、图表数据等）
  sql?: string;         // SQL语句
  chart?: any;          // 图表数据
  error?: string;       // 错误信息
}

// 对话历史接口
export interface ChatHistory {
  messages: ChatMessage[];  // 对话消息列表
  currentChatId: number | null;  // 当前会话ID
}

// 分析结果接口
export interface AnalysisResult {
  type: AnalysisType;
  content: string;
  data?: any;
  sql?: string;
  chart?: any;
  error?: string;
}
