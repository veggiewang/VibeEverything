// 可视化类型
export type VisualizationType =
  | 'wordcloud'    // 词云
  | 'timeline'     // 时间线
  | 'flowchart'    // 流程图
  | 'chart'        // 图表
  | 'mindmap'      // 思维导图
  | 'calendar'     // 日历
  | 'photowall';   // 照片墙

// 解析后的文本数据
export interface ParsedData {
  text: string;              // 原始文本
  keywords: KeywordData[];   // 关键词
  dates: DateData[];         // 日期
  events: EventData[];       // 事件
  relationships: RelationshipData[]; // 关系
  sentences: string[];       // 句子
  statistics: TextStatistics; // 统计信息
}

// 关键词数据
export interface KeywordData {
  word: string;
  count: number;
  weight: number;
  category?: string;
}

// 日期数据
export interface DateData {
  date: Date;
  text: string;
  context: string;
}

// 事件数据
export interface EventData {
  id: string;
  title: string;
  content: string;
  date?: Date;
  startDate?: Date;
  endDate?: Date;
  category?: string;
  tags?: string[];
}

// 关系数据（用于流程图、思维导图）
export interface RelationshipData {
  id: string;
  source: string;
  target: string;
  type: string;
  label?: string;
}

// 节点数据（用于流程图、思维导图）
export interface NodeData {
  id: string;
  label: string;
  type?: string;
  data?: any;
  position?: { x: number; y: number };
}

// 文本统计信息
export interface TextStatistics {
  totalWords: number;
  totalCharacters: number;
  totalSentences: number;
  uniqueWords: number;
  averageWordsPerSentence: number;
}

// 可视化配置
export interface VisualizationConfig {
  type: VisualizationType;
  title?: string;
  colors?: string[];
  fontSize?: number;
  width?: number;
  height?: number;
  customOptions?: Record<string, any>;
}

// 导出格式
export type ExportFormat = 'png' | 'jpg' | 'svg' | 'pdf' | 'json';

// 导入数据格式
export interface ImportData {
  format: 'text' | 'csv' | 'json' | 'excel';
  content: string | any[];
}

// 应用状态
export interface AppState {
  // 数据
  rawText: string;
  parsedData: ParsedData | null;

  // 可视化
  currentVisualization: VisualizationType | null;
  visualizationConfig: VisualizationConfig | null;

  // UI 状态
  isLoading: boolean;
  error: string | null;

  // 操作
  setRawText: (text: string) => void;
  setParsedData: (data: ParsedData) => void;
  setVisualization: (type: VisualizationType, config?: Partial<VisualizationConfig>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}
