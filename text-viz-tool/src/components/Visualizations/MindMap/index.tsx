import React from 'react';
import { Card, Empty } from 'antd';
import ReactECharts from 'echarts-for-react';
import { useAppStore } from '../../../store/useAppStore';

export const MindMapVisualization: React.FC = () => {
  const { parsedData, visualizationConfig } = useAppStore();

  if (!parsedData || parsedData.keywords.length === 0) {
    return (
      <Card>
        <Empty description="没有足够的数据生成思维导图" />
      </Card>
    );
  }

  // 构建思维导图数据结构
  const topKeywords = parsedData.keywords.slice(0, 5);
  const colors = visualizationConfig?.colors || [
    '#1890ff',
    '#52c41a',
    '#faad14',
    '#f5222d',
    '#722ed1',
  ];

  // 创建树形结构
  const treeData = {
    name: parsedData.statistics.totalWords + ' 个词',
    children: topKeywords.map((kw, index) => ({
      name: kw.word,
      value: kw.count,
      itemStyle: { color: colors[index % colors.length] },
      children: parsedData.keywords
        .slice(5, 5 + Math.min(3, parsedData.keywords.length - 5))
        .map((subKw) => ({
          name: subKw.word,
          value: subKw.count,
        })),
    })),
  };

  const option = {
    title: {
      text: visualizationConfig?.title || '概念关系图',
      left: 'center',
    },
    tooltip: {
      trigger: 'item',
      triggerOn: 'mousemove',
      formatter: (params: any) => {
        return `${params.name}<br/>出现次数: ${params.value || ''}`;
      },
    },
    series: [
      {
        type: 'tree',
        data: [treeData],
        top: '10%',
        left: '8%',
        bottom: '10%',
        right: '20%',
        symbolSize: 14,
        label: {
          position: 'left',
          verticalAlign: 'middle',
          align: 'right',
          fontSize: 14,
        },
        leaves: {
          label: {
            position: 'right',
            verticalAlign: 'middle',
            align: 'left',
          },
        },
        emphasis: {
          focus: 'descendant',
        },
        expandAndCollapse: true,
        animationDuration: 550,
        animationDurationUpdate: 750,
      },
    ],
  };

  return (
    <Card title="思维导图可视化">
      <ReactECharts option={option} style={{ height: '600px' }} />
      <div style={{ marginTop: 12, color: '#999', fontSize: 12 }}>
        点击节点可以展开或收起子节点
      </div>
    </Card>
  );
};
