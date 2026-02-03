import * as chrono from 'chrono-node';
import type { ParsedData, KeywordData, DateData, EventData, TextStatistics } from '../types';

// 中文停用词（简化版）
const CHINESE_STOPWORDS = new Set([
  '的', '了', '在', '是', '我', '有', '和', '就', '不', '人', '都', '一', '一个', '上', '也',
  '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好', '自己', '这', '那',
  '这个', '那个', '什么', '这样', '那样', '为', '以', '与', '及', '等', '为了', '因为',
  '所以', '但是', '如果', '虽然', '因此', '然而', '而且', '或者', '并且', '可以', '能够'
]);

// 英文停用词（简化版）
const ENGLISH_STOPWORDS = new Set([
  'the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but', 'in', 'with', 'to', 'for',
  'of', 'as', 'by', 'that', 'this', 'it', 'from', 'be', 'are', 'was', 'were', 'been', 'have',
  'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can'
]);

/**
 * 解析文本并提取结构化数据
 */
export async function parseText(text: string): Promise<ParsedData> {
  if (!text || text.trim().length === 0) {
    throw new Error('文本不能为空');
  }

  try {
    // 1. 提取关键词
    const keywords = extractKeywords(text);

    // 2. 提取日期
    const dates = extractDates(text);

    // 3. 提取事件（基于日期和句子）
    const events = extractEvents(text, dates);

    // 4. 分句
    const sentences = splitIntoSentences(text);

    // 5. 计算统计信息
    const statistics = calculateStatistics(text, sentences);

    return {
      text,
      keywords,
      dates,
      events,
      relationships: [], // 关系提取需要更复杂的 NLP，暂时返回空数组
      sentences,
      statistics,
    };
  } catch (error) {
    console.error('文本解析错误:', error);
    throw new Error('文本解析失败，请检查输入内容');
  }
}

/**
 * 提取关键词
 */
function extractKeywords(text: string): KeywordData[] {
  // 简单的关键词提取：分词 + 词频统计
  const words = tokenize(text);
  const wordCount = new Map<string, number>();

  // 统计词频
  words.forEach((word) => {
    if (word.length > 1 && !isStopword(word)) {
      wordCount.set(word, (wordCount.get(word) || 0) + 1);
    }
  });

  // 转换为 KeywordData 数组并排序
  const keywords = Array.from(wordCount.entries())
    .map(([word, count]) => ({
      word,
      count,
      weight: count / Math.max(...wordCount.values()), // 归一化权重
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 50); // 取前 50 个关键词

  return keywords;
}

/**
 * 分词（简单版本）
 */
function tokenize(text: string): string[] {
  // 中文分词：按字分割（简化版，实际应使用专业分词库）
  // 英文分词：按空格和标点分割
  const words: string[] = [];

  // 移除标点和特殊字符
  const cleaned = text.replace(/[^\w\s\u4e00-\u9fa5]/g, ' ');

  // 英文单词（按空格分割）
  const englishWords = cleaned.match(/[a-zA-Z]+/g) || [];
  words.push(...englishWords.map((w) => w.toLowerCase()));

  // 中文词语（简单的 2-3 字组合）
  const chineseText = cleaned.replace(/[a-zA-Z\s]/g, '');
  for (let i = 0; i < chineseText.length - 1; i++) {
    // 2字词
    words.push(chineseText.substring(i, i + 2));
    // 3字词
    if (i < chineseText.length - 2) {
      words.push(chineseText.substring(i, i + 3));
    }
  }

  return words;
}

/**
 * 判断是否为停用词
 */
function isStopword(word: string): boolean {
  return CHINESE_STOPWORDS.has(word) || ENGLISH_STOPWORDS.has(word.toLowerCase());
}

/**
 * 提取日期
 */
function extractDates(text: string): DateData[] {
  const dates: DateData[] = [];

  try {
    const parsedDates = chrono.parse(text);

    parsedDates.forEach((parsed) => {
      if (parsed.start) {
        dates.push({
          date: parsed.start.date(),
          text: parsed.text,
          context: getContext(text, parsed.index, 50),
        });
      }
    });
  } catch (error) {
    console.error('日期提取错误:', error);
  }

  return dates;
}

/**
 * 获取文本上下文
 */
function getContext(text: string, index: number, length: number = 50): string {
  const start = Math.max(0, index - length);
  const end = Math.min(text.length, index + length);
  return text.substring(start, end);
}

/**
 * 提取事件
 */
function extractEvents(text: string, dates: DateData[]): EventData[] {
  const sentences = splitIntoSentences(text);
  const events: EventData[] = [];

  sentences.forEach((sentence, index) => {
    // 查找句子中是否包含日期
    const dateInSentence = dates.find((d) => sentence.includes(d.text));

    // 如果句子包含日期或包含事件关键词，则视为事件
    const eventKeywords = ['发生', '举行', '完成', '开始', '结束', '发布', '启动', '召开'];
    const hasEventKeyword = eventKeywords.some((keyword) => sentence.includes(keyword));

    if (dateInSentence || hasEventKeyword) {
      events.push({
        id: `event-${index}`,
        title: sentence.length > 30 ? sentence.substring(0, 30) + '...' : sentence,
        content: sentence,
        date: dateInSentence?.date,
      });
    }
  });

  return events;
}

/**
 * 分句
 */
function splitIntoSentences(text: string): string[] {
  // 按句号、问号、感叹号分句
  const sentences = text
    .split(/[。！？.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  return sentences;
}

/**
 * 计算统计信息
 */
function calculateStatistics(text: string, sentences: string[]): TextStatistics {
  const words = tokenize(text);
  const uniqueWords = new Set(words.filter((w) => w.length > 1));

  return {
    totalWords: words.length,
    totalCharacters: text.length,
    totalSentences: sentences.length,
    uniqueWords: uniqueWords.size,
    averageWordsPerSentence: words.length / Math.max(sentences.length, 1),
  };
}

/**
 * 从 CSV 导入数据
 */
export function parseCSV(csvText: string): any[] {
  // 简单的 CSV 解析
  const lines = csvText.split('\n').filter((line) => line.trim().length > 0);
  if (lines.length === 0) return [];

  const headers = lines[0].split(',').map((h) => h.trim());
  const data = lines.slice(1).map((line) => {
    const values = line.split(',').map((v) => v.trim());
    const row: any = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    return row;
  });

  return data;
}

/**
 * 从 JSON 导入数据
 */
export function parseJSON(jsonText: string): any {
  try {
    return JSON.parse(jsonText);
  } catch (error) {
    throw new Error('JSON 格式错误');
  }
}
