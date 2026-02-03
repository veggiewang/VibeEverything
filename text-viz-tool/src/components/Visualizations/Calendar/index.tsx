import React from 'react';
import { Card, Empty, Calendar as AntCalendar, Badge, List } from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { useAppStore } from '../../../store/useAppStore';
import type { EventData } from '../../../types';

export const CalendarVisualization: React.FC = () => {
  const { parsedData, visualizationConfig } = useAppStore();

  if (!parsedData || parsedData.events.length === 0) {
    return (
      <Card>
        <Empty description="没有识别到带日期的事件" />
      </Card>
    );
  }

  // 过滤出有日期的事件
  const eventsWithDates = parsedData.events.filter((event) => event.date);

  if (eventsWithDates.length === 0) {
    return (
      <Card>
        <Empty description="没有识别到带日期的事件，请在文本中包含具体日期" />
      </Card>
    );
  }

  // 按日期分组事件
  const eventsByDate = new Map<string, EventData[]>();
  eventsWithDates.forEach((event) => {
    if (event.date) {
      const dateKey = dayjs(event.date).format('YYYY-MM-DD');
      const existing = eventsByDate.get(dateKey) || [];
      eventsByDate.set(dateKey, [...existing, event]);
    }
  });

  const colors = visualizationConfig?.colors || [
    '#1890ff',
    '#52c41a',
    '#faad14',
    '#f5222d',
    '#722ed1',
  ];

  // 日历单元格渲染
  const dateCellRender = (value: Dayjs) => {
    const dateKey = value.format('YYYY-MM-DD');
    const events = eventsByDate.get(dateKey);

    if (!events || events.length === 0) return null;

    return (
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {events.map((event, index) => (
          <li key={event.id}>
            <Badge
              status="success"
              text={
                <span
                  style={{
                    fontSize: 12,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    display: 'inline-block',
                    maxWidth: '100%',
                  }}
                >
                  {event.title}
                </span>
              }
              color={colors[index % colors.length]}
            />
          </li>
        ))}
      </ul>
    );
  };

  return (
    <Card title={visualizationConfig?.title || '日历视图'}>
      <AntCalendar cellRender={dateCellRender} />

      <Card title="事件列表" style={{ marginTop: 16 }} size="small">
        <List
          dataSource={eventsWithDates}
          renderItem={(event) => (
            <List.Item>
              <List.Item.Meta
                title={event.title}
                description={
                  <>
                    <div>{event.content}</div>
                    <div style={{ color: '#999', fontSize: 12, marginTop: 4 }}>
                      {event.date ? dayjs(event.date).format('YYYY年MM月DD日') : ''}
                    </div>
                  </>
                }
              />
            </List.Item>
          )}
        />
      </Card>
    </Card>
  );
};
