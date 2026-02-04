import * as chrono from 'chrono-node';
import type { ParsedData, KeywordData, DateData, EventData, TextStatistics } from '../types';

// 中文停用词（扩展版）
const CHINESE_STOPWORDS = new Set([
  '的', '了', '在', '是', '我', '有', '和', '就', '不', '人', '都', '一', '一个', '上', '也',
  '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好', '自己', '这', '那',
  '这个', '那个', '什么', '这样', '那样', '为', '以', '与', '及', '等', '为了', '因为',
  '所以', '但是', '如果', '虽然', '因此', '然而', '而且', '或者', '并且', '可以', '能够',
  '他', '她', '它', '我们', '你们', '他们', '这些', '那些', '之', '其', '将', '已', '被',
  '把', '从', '向', '对', '给', '用', '让', '使', '得', '着', '过', '来', '去', '出'
]);

// 英文停用词（扩展版）
const ENGLISH_STOPWORDS = new Set([
  'the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but', 'in', 'with', 'to', 'for',
  'of', 'as', 'by', 'that', 'this', 'it', 'from', 'be', 'are', 'was', 'were', 'been', 'have',
  'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can',
  'their', 'they', 'them', 'there', 'when', 'where', 'who', 'whom', 'whose', 'why', 'how'
]);

// 常见专业术语词库（AI/科技领域）
const DOMAIN_TERMS = new Set([
  '人工智能', '深度学习', '机器学习', '神经网络', '自然语言处理', '计算机视觉',
  '大数据', '云计算', '物联网', '区块链', '量子计算', '边缘计算',
  '语言模型', '生成式', '多模态', '强化学习', '迁移学习', '对抗网络',
  '卷积网络', '循环网络', '注意力机制', '预训练模型'
]);

export interface ParseOptions {
  customKeywords?: string[]; // 用户自定义关键词
  minWordLength?: number;    // 最小词长
  maxKeywords?: number;      // 最大关键词数
  extractEvents?: boolean;   // 是否提取事件
  sortByTime?: boolean;      // 是否按时间排序
  minFrequency?: number;     // 最小词频（用于过滤噪音）
}

/**
 * 解析文本并提取结构化数据
 */
export async function parseText(text: string, options: ParseOptions = {}): Promise<ParsedData> {
  if (!text || text.trim().length === 0) {
    throw new Error('文本不能为空');
  }

  const {
    customKeywords = [],
    minWordLength = 2,
    maxKeywords = 50,
    extractEvents = true,
    sortByTime = true,
    minFrequency = 1,
  } = options;

  try {
    // 1. 提取日期（优先，因为其他步骤可能需要）
    const dates = extractDates(text);

    // 2. 分句
    const sentences = splitIntoSentences(text);

    // 3. 如果需要按时间排序，对句子排序
    let sortedSentences = sentences;
    if (sortByTime && dates.length > 0) {
      sortedSentences = sortSentencesByTime(sentences, dates);
    }

    // 4. 提取关键词（使用优化后的算法）
    const keywords = extractKeywords(text, {
      customKeywords,
      minWordLength,
      maxKeywords,
      minFrequency,
    });

    // 5. 提取事件
    const events = extractEvents ? extractEventsFromText(text, dates, sortedSentences) : [];

    // 6. 计算统计信息
    const statistics = calculateStatistics(text, sentences);

    return {
      text,
      keywords,
      dates,
      events,
      relationships: [],
      sentences: sortedSentences,
      statistics,
    };
  } catch (error) {
    console.error('文本解析错误:', error);
    throw new Error('文本解析失败，请检查输入内容');
  }
}

/**
 * 改进的分词算法（V3.0）
 * 使用词频过滤 + 长词优先策略
 */
function tokenize(text: string): string[] {
  const words: string[] = [];

  // 1. 提取年份（4位数字）
  const years = text.match(/\d{4}年?/g) || [];
  years.forEach((year) => words.push(year.replace('年', '')));

  // 2. 提取数字（包括小数、百分比等）
  const numbers = text.match(/\d+\.?\d*[万亿百千兆%]?/g) || [];
  words.push(...numbers);

  // 3. 提取英文单词和专有名词
  const englishWords = text.match(/[A-Z][a-z]+(?:[A-Z][a-z]+)*/g) || []; // 驼峰命名
  const normalWords = text.match(/[a-zA-Z]+(?:-[a-zA-Z]+)*/g) || []; // 普通单词和连字符
  const acronyms = text.match(/[A-Z]{2,}/g) || []; // 大写缩写
  const wordsWithNumbers = text.match(/[a-zA-Z]+\d+|\d+[a-zA-Z]+/gi) || []; // 字母+数字

  words.push(
    ...englishWords,
    ...normalWords.map((w) => w.toLowerCase()),
    ...acronyms,
    ...wordsWithNumbers
  );

  // 4. 提取中文词语（优化版）
  const chineseWords = extractChineseWords(text);
  words.push(...chineseWords);

  return words;
}

/**
 * 提取中文词语（使用词频过滤和长词优先策略）
 */
function extractChineseWords(text: string): string[] {
  // 移除非中文字符，只保留纯中文
  let chineseText = text;
  chineseText = chineseText.replace(/[^\u4e00-\u9fa5]/g, '');

  if (chineseText.length === 0) return [];

  // 第一步：生成所有可能的词（2-5字）
  const allCandidates = new Map<string, number>();

  for (let len = 5; len >= 2; len--) {
    for (let i = 0; i <= chineseText.length - len; i++) {
      const word = chineseText.substring(i, i + len);
      allCandidates.set(word, (allCandidates.get(word) || 0) + 1);
    }
  }

  // 第二步：词频过滤 - 只保留出现次数 >= 2 或者在专业词库中的词
  const frequentWords = new Map<string, number>();
  allCandidates.forEach((count, word) => {
    if (count >= 2 || DOMAIN_TERMS.has(word)) {
      frequentWords.set(word, count);
    }
  });

  // 第三步：长词优先 - 如果一个词是另一个词的子串，优先保留长词
  const finalWords = new Set<string>();
  const sortedWords = Array.from(frequentWords.keys()).sort((a, b) => b.length - a.length);

  for (const word of sortedWords) {
    // 检查是否已经有更长的词包含这个词
    let isSubstring = false;
    for (const existing of finalWords) {
      if (existing.includes(word) && existing !== word) {
        isSubstring = true;
        break;
      }
    }

    if (!isSubstring) {
      finalWords.add(word);
    }
  }

  // 第四步：再次过滤单字词和短词（除非出现频率很高）
  const result: string[] = [];
  finalWords.forEach((word) => {
    const count = frequentWords.get(word) || 0;
    // 2字词需要出现2次以上，3字以上词保留，或者是专业术语
    if (word.length >= 3 || count >= 2 || DOMAIN_TERMS.has(word)) {
      result.push(word);
    }
  });

  return result;
}

/**
 * 提取关键词（优化版）
 */
function extractKeywords(
  text: string,
  options: {
    customKeywords?: string[];
    minWordLength?: number;
    maxKeywords?: number;
    minFrequency?: number;
  } = {}
): KeywordData[] {
  const {
    customKeywords = [],
    minWordLength = 2,
    maxKeywords = 50,
    minFrequency = 1,
  } = options;

  const words = tokenize(text);
  const wordCount = new Map<string, number>();

  // 统计词频
  words.forEach((word) => {
    if (word.length >= minWordLength && !isStopword(word)) {
      wordCount.set(word, (wordCount.get(word) || 0) + 1);
    }
  });

  // 添加用户自定义关键词（如果在文本中出现）
  customKeywords.forEach((keyword) => {
    const count = (text.match(new RegExp(keyword, 'g')) || []).length;
    if (count > 0) {
      wordCount.set(keyword, count);
    }
  });

  // 添加专业术语（如果在文本中出现）
  DOMAIN_TERMS.forEach((term) => {
    if (text.includes(term)) {
      const count = (text.match(new RegExp(term, 'g')) || []).length;
      wordCount.set(term, count);
    }
  });

  // 词频过滤：只保留出现次数 >= minFrequency 的词
  const filteredWords = new Map<string, number>();
  wordCount.forEach((count, word) => {
    if (count >= minFrequency) {
      filteredWords.set(word, count);
    }
  });

  // 转换为 KeywordData 数组并排序
  const maxCount = Math.max(...filteredWords.values(), 1);
  const keywords = Array.from(filteredWords.entries())
    .map(([word, count]) => ({
      word,
      count,
      weight: count / maxCount,
    }))
    .sort((a, b) => {
      // 优先按词频排序，词频相同时按词长排序（长词优先）
      if (b.count !== a.count) {
        return b.count - a.count;
      }
      return b.word.length - a.word.length;
    })
    .slice(0, maxKeywords);

  return keywords;
}

/**
 * 判断是否为停用词
 */
function isStopword(word: string): boolean {
  return CHINESE_STOPWORDS.has(word) || ENGLISH_STOPWORDS.has(word.toLowerCase());
}

/**
 * 提取日期（V3.0 增强版）
 * 支持完整的中文日期格式
 */
function extractDates(text: string): DateData[] {
  const dates: DateData[] = [];
  const seenDates = new Set<string>();

  try {
    // 1. 使用 chrono-node 解析英文日期
    const parsedDates = chrono.parse(text, new Date(), { forwardDate: true });

    parsedDates.forEach((parsed) => {
      if (parsed.start) {
        const date = parsed.start.date();
        const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

        if (!seenDates.has(dateKey)) {
          seenDates.add(dateKey);
          dates.push({
            date,
            text: parsed.text,
            context: getContext(text, parsed.index, 80),
          });
        }
      }
    });

    // 2. 处理中文日期格式："2016年3月"、"2022年11月"
    const yearMonthPattern = /(\d{4})年(\d{1,2})月/g;
    let match;
    while ((match = yearMonthPattern.exec(text)) !== null) {
      const year = parseInt(match[1]);
      const month = parseInt(match[2]);

      if (year >= 1900 && year <= 2100 && month >= 1 && month <= 12) {
        const date = new Date(year, month - 1, 1); // month-1 因为 JS 月份从0开始
        const dateKey = `${year}-${month - 1}-1`;

        if (!seenDates.has(dateKey)) {
          seenDates.add(dateKey);
          dates.push({
            date,
            text: match[0],
            context: getContext(text, match.index, 80),
          });
        }
      }
    }

    // 3. 处理纯年份格式："2012年"（只在没有月份时才添加）
    const yearOnlyPattern = /(\d{4})年(?!\d{1,2}月)/g;
    while ((match = yearOnlyPattern.exec(text)) !== null) {
      const year = parseInt(match[1]);

      if (year >= 1900 && year <= 2100) {
        const date = new Date(year, 0, 1);
        const dateKey = `${year}-0-1`;

        if (!seenDates.has(dateKey)) {
          seenDates.add(dateKey);
          dates.push({
            date,
            text: match[0],
            context: getContext(text, match.index, 80),
          });
        }
      }
    }

    // 4. 处理"年月日"格式："2022年11月30日"
    const fullDatePattern = /(\d{4})年(\d{1,2})月(\d{1,2})日/g;
    while ((match = fullDatePattern.exec(text)) !== null) {
      const year = parseInt(match[1]);
      const month = parseInt(match[2]);
      const day = parseInt(match[3]);

      if (year >= 1900 && year <= 2100 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
        const date = new Date(year, month - 1, day);
        const dateKey = `${year}-${month - 1}-${day}`;

        if (!seenDates.has(dateKey)) {
          seenDates.add(dateKey);
          dates.push({
            date,
            text: match[0],
            context: getContext(text, match.index, 80),
          });
        }
      }
    }

  } catch (error) {
    console.error('日期提取错误:', error);
  }

  // 按日期排序
  return dates.sort((a, b) => a.date.getTime() - b.date.getTime());
}

/**
 * 获取文本上下文
 */
function getContext(text: string, index: number, length: number = 80): string {
  const start = Math.max(0, index - length);
  const end = Math.min(text.length, index + length);
  return text.substring(start, end).trim();
}

/**
 * 提取事件（改进版）
 */
function extractEventsFromText(_text: string, dates: DateData[], sentences: string[]): EventData[] {
  const events: EventData[] = [];
  const eventKeywords = [
    '发生', '举行', '完成', '开始', '结束', '发布', '启动', '召开', '宣布',
    '成立', '推出', '上线', '问世', '诞生', '突破', '战胜', '击败', '取得',
    '实现', '达成', '创造', '建立', '发现', '提出', '研发', '大放异彩', '震惊',
    '改变', '展现', '引发', '渗透', '融入'
  ];

  sentences.forEach((sentence, index) => {
    // 查找句子中是否包含日期
    const datesInSentence = dates.filter((d) => sentence.includes(d.text));

    // 检查是否包含事件关键词
    const hasEventKeyword = eventKeywords.some((keyword) => sentence.includes(keyword));

    // 如果句子包含日期或事件关键词，则视为事件
    if (datesInSentence.length > 0 || hasEventKeyword) {
      // 使用第一个日期作为事件日期
      const eventDate = datesInSentence.length > 0 ? datesInSentence[0].date : undefined;

      events.push({
        id: `event-${index}-${Date.now()}`,
        title: sentence.length > 40 ? sentence.substring(0, 40) + '...' : sentence,
        content: sentence,
        date: eventDate,
      });
    }
  });

  // 按日期排序（有日期的在前，按时间排序；无日期的在后）
  return events.sort((a, b) => {
    if (a.date && b.date) {
      return a.date.getTime() - b.date.getTime();
    }
    if (a.date && !b.date) return -1;
    if (!a.date && b.date) return 1;
    return 0;
  });
}

/**
 * 分句（改进版）
 */
function splitIntoSentences(text: string): string[] {
  // 按句号、问号、感叹号、换行符分句
  const sentences = text
    .split(/[。！？.!?\n]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  return sentences;
}

/**
 * 按时间排序句子
 */
function sortSentencesByTime(sentences: string[], dates: DateData[]): string[] {
  // 为每个句子关联日期
  const sentencesWithDate = sentences.map((sentence) => {
    const dateInSentence = dates.find((d) => sentence.includes(d.text));
    return {
      sentence,
      date: dateInSentence?.date,
    };
  });

  // 排序：有日期的按时间排序在前，无日期的保持原顺序在后
  const withDate = sentencesWithDate.filter((s) => s.date);
  const withoutDate = sentencesWithDate.filter((s) => !s.date);

  withDate.sort((a, b) => (a.date!.getTime() - b.date!.getTime()));

  return [...withDate.map((s) => s.sentence), ...withoutDate.map((s) => s.sentence)];
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
