import React, { useEffect, useRef } from 'react';
import { Card, Empty } from 'antd';
import WordCloud from 'wordcloud';
import { useAppStore } from '../../../store/useAppStore';

export const WordCloudVisualization: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { parsedData, visualizationConfig } = useAppStore();

  useEffect(() => {
    if (!parsedData || !canvasRef.current || !visualizationConfig) return;

    const canvas = canvasRef.current;
    const keywords = parsedData.keywords;

    if (keywords.length === 0) {
      return;
    }

    // 准备词云数据
    const wordList: [string, number][] = keywords.map((kw) => [kw.word, kw.count * 10]);

    // 配置词云
    const options = {
      list: wordList,
      gridSize: 8,
      weightFactor: 2,
      fontFamily: 'Arial, Microsoft YaHei, sans-serif',
      color: () => {
        const colors = visualizationConfig.colors || [
          '#1890ff',
          '#52c41a',
          '#faad14',
          '#f5222d',
          '#722ed1',
        ];
        return colors[Math.floor(Math.random() * colors.length)];
      },
      rotateRatio: 0.3,
      backgroundColor: '#fff',
      minSize: visualizationConfig.fontSize || 12,
    };

    try {
      WordCloud(canvas, options);
    } catch (error) {
      console.error('词云生成错误:', error);
    }
  }, [parsedData, visualizationConfig]);

  if (!parsedData || parsedData.keywords.length === 0) {
    return (
      <Card>
        <Empty description="没有足够的关键词数据生成词云" />
      </Card>
    );
  }

  return (
    <Card title={visualizationConfig?.title || '词云可视化'}>
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <canvas
          ref={canvasRef}
          width={visualizationConfig?.width || 800}
          height={visualizationConfig?.height || 600}
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      </div>
    </Card>
  );
};
