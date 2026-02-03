import React from 'react';
import { Card, Empty, Row, Col, Tag } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import { useAppStore } from '../../../store/useAppStore';

export const PhotoWallVisualization: React.FC = () => {
  const { parsedData, visualizationConfig } = useAppStore();

  if (!parsedData) {
    return (
      <Card>
        <Empty description="没有可用的数据" />
      </Card>
    );
  }

  const colors = visualizationConfig?.colors || [
    '#1890ff',
    '#52c41a',
    '#faad14',
    '#f5222d',
    '#722ed1',
  ];

  // 从句子和事件创建卡片
  const cards = [
    // 事件卡片
    ...parsedData.events.map((event, index) => ({
      id: event.id,
      type: 'event',
      title: event.title,
      content: event.content,
      date: event.date,
      color: colors[index % colors.length],
    })),
    // 关键词卡片
    ...parsedData.keywords.slice(0, 10).map((kw, index) => ({
      id: `keyword-${index}`,
      type: 'keyword',
      title: kw.word,
      content: `出现 ${kw.count} 次`,
      date: undefined,
      color: colors[index % colors.length],
    })),
  ];

  return (
    <Card title={visualizationConfig?.title || '内容卡片墙'}>
      <Row gutter={[16, 16]}>
        {cards.map((card) => (
          <Col xs={24} sm={12} md={8} lg={6} key={card.id}>
            <Card
              hoverable
              style={{
                borderTop: `4px solid ${card.color}`,
                height: '100%',
                minHeight: 180,
              }}
              bodyStyle={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
              }}
            >
              <div style={{ flex: 1 }}>
                <h4
                  style={{
                    marginBottom: 8,
                    color: card.color,
                    fontSize: 16,
                    fontWeight: 'bold',
                  }}
                >
                  {card.title}
                </h4>
                <p style={{ color: '#666', fontSize: 14, marginBottom: 12 }}>{card.content}</p>
              </div>

              <div style={{ marginTop: 'auto' }}>
                <Tag color={card.type === 'event' ? 'blue' : 'orange'}>
                  {card.type === 'event' ? '事件' : '关键词'}
                </Tag>
                {card.date && (
                  <div style={{ marginTop: 8, fontSize: 12, color: '#999' }}>
                    <ClockCircleOutlined style={{ marginRight: 4 }} />
                    {card.date.toLocaleDateString('zh-CN')}
                  </div>
                )}
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {cards.length === 0 && <Empty description="没有足够的内容生成卡片墙" />}
    </Card>
  );
};
