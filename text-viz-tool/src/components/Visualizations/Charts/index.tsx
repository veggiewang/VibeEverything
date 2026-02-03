import React from 'react';
import { Card, Empty, Row, Col } from 'antd';
import ReactECharts from 'echarts-for-react';
import { useAppStore } from '../../../store/useAppStore';

export const ChartsVisualization: React.FC = () => {
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

  // 关键词柱状图
  const keywordBarOption = {
    title: {
      text: '热门关键词',
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    xAxis: {
      type: 'category',
      data: parsedData.keywords.slice(0, 10).map((kw) => kw.word),
      axisLabel: {
        rotate: 45,
      },
    },
    yAxis: {
      type: 'value',
      name: '出现次数',
    },
    series: [
      {
        data: parsedData.keywords.slice(0, 10).map((kw) => ({
          value: kw.count,
          itemStyle: { color: colors[0] },
        })),
        type: 'bar',
        showBackground: true,
        backgroundStyle: {
          color: 'rgba(180, 180, 180, 0.2)',
        },
      },
    ],
  };

  // 文本统计饼图
  const statisticsPieOption = {
    title: {
      text: '文本组成',
      left: 'center',
    },
    tooltip: {
      trigger: 'item',
    },
    legend: {
      orient: 'vertical',
      left: 'left',
    },
    series: [
      {
        name: '统计信息',
        type: 'pie',
        radius: '50%',
        data: [
          { value: parsedData.statistics.totalWords, name: '总词数', itemStyle: { color: colors[0] } },
          {
            value: parsedData.statistics.uniqueWords,
            name: '独特词数',
            itemStyle: { color: colors[1] },
          },
          {
            value: parsedData.statistics.totalSentences,
            name: '句子数',
            itemStyle: { color: colors[2] },
          },
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      },
    ],
  };

  // 事件时间分布（如果有日期数据）
  const eventsWithDates = parsedData.events.filter((e) => e.date);
  let timeDistributionOption = null;

  if (eventsWithDates.length > 0) {
    const dateCount = new Map<string, number>();
    eventsWithDates.forEach((event) => {
      if (event.date) {
        const dateStr = event.date.toISOString().split('T')[0];
        dateCount.set(dateStr, (dateCount.get(dateStr) || 0) + 1);
      }
    });

    const sortedDates = Array.from(dateCount.entries()).sort(
      (a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime()
    );

    timeDistributionOption = {
      title: {
        text: '事件时间分布',
        left: 'center',
      },
      tooltip: {
        trigger: 'axis',
      },
      xAxis: {
        type: 'category',
        data: sortedDates.map((d) => d[0]),
        axisLabel: {
          rotate: 45,
        },
      },
      yAxis: {
        type: 'value',
        name: '事件数',
      },
      series: [
        {
          data: sortedDates.map((d) => d[1]),
          type: 'line',
          smooth: true,
          areaStyle: {
            color: colors[3],
            opacity: 0.3,
          },
          lineStyle: {
            color: colors[3],
          },
          itemStyle: {
            color: colors[3],
          },
        },
      ],
    };
  }

  return (
    <Card title={visualizationConfig?.title || '数据图表'}>
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <ReactECharts option={keywordBarOption} style={{ height: '400px' }} />
        </Col>
        <Col xs={24} lg={12}>
          <ReactECharts option={statisticsPieOption} style={{ height: '400px' }} />
        </Col>
        {timeDistributionOption && (
          <Col xs={24}>
            <ReactECharts option={timeDistributionOption} style={{ height: '400px' }} />
          </Col>
        )}
      </Row>
    </Card>
  );
};
