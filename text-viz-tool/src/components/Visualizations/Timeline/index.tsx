import React from 'react';
import { Card, Empty, Timeline as AntTimeline } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import { useAppStore } from '../../../store/useAppStore';

export const TimelineVisualization: React.FC = () => {
  const { parsedData, visualizationConfig } = useAppStore();

  if (!parsedData || parsedData.events.length === 0) {
    return (
      <Card>
        <Empty description="没有识别到时间相关的事件" />
      </Card>
    );
  }

  // 按日期排序事件
  const sortedEvents = [...parsedData.events]
    .filter((event) => event.date)
    .sort((a, b) => {
      if (!a.date || !b.date) return 0;
      return a.date.getTime() - b.date.getTime();
    });

  const colors = visualizationConfig?.colors || [
    '#1890ff',
    '#52c41a',
    '#faad14',
    '#f5222d',
    '#722ed1',
  ];

  return (
    <Card title={visualizationConfig?.title || '时间线可视化'}>
      <div style={{ padding: '20px' }}>
        <AntTimeline mode="left">
          {sortedEvents.map((event, index) => (
            <AntTimeline.Item
              key={event.id}
              color={colors[index % colors.length]}
              dot={<ClockCircleOutlined style={{ fontSize: '16px' }} />}
              label={
                event.date ? (
                  <span style={{ fontWeight: 'bold' }}>
                    {event.date.toLocaleDateString('zh-CN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                ) : null
              }
            >
              <div>
                <h4 style={{ marginBottom: 8 }}>{event.title}</h4>
                <p style={{ color: '#666', marginBottom: 0 }}>{event.content}</p>
              </div>
            </AntTimeline.Item>
          ))}
        </AntTimeline>

        {sortedEvents.length === 0 && (
          <Empty description="未找到包含日期的事件，请确保文本中包含时间信息" />
        )}
      </div>
    </Card>
  );
};
