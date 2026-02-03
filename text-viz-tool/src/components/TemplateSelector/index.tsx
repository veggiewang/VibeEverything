import React from 'react';
import { Card, Row, Col, Typography } from 'antd';
import {
  CloudOutlined,
  ClockCircleOutlined,
  ApartmentOutlined,
  BarChartOutlined,
  BranchesOutlined,
  CalendarOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import { useAppStore } from '../../store/useAppStore';
import type { VisualizationType } from '../../types';
import './styles.css';

const { Title, Text } = Typography;

interface TemplateOption {
  type: VisualizationType;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const TEMPLATES: TemplateOption[] = [
  {
    type: 'wordcloud',
    title: '词云',
    description: '展示文本中的高频关键词',
    icon: <CloudOutlined />,
    color: '#1890ff',
  },
  {
    type: 'timeline',
    title: '时间线',
    description: '按时间顺序展示事件',
    icon: <ClockCircleOutlined />,
    color: '#52c41a',
  },
  {
    type: 'flowchart',
    title: '流程图',
    description: '展示流程和步骤关系',
    icon: <ApartmentOutlined />,
    color: '#faad14',
  },
  {
    type: 'chart',
    title: '图表',
    description: '数据统计图表展示',
    icon: <BarChartOutlined />,
    color: '#f5222d',
  },
  {
    type: 'mindmap',
    title: '思维导图',
    description: '展示概念和关联关系',
    icon: <BranchesOutlined />,
    color: '#722ed1',
  },
  {
    type: 'calendar',
    title: '日历',
    description: '在日历上标注事件',
    icon: <CalendarOutlined />,
    color: '#13c2c2',
  },
  {
    type: 'photowall',
    title: '照片墙',
    description: '瀑布流展示内容卡片',
    icon: <AppstoreOutlined />,
    color: '#eb2f96',
  },
];

export const TemplateSelector: React.FC = () => {
  const { parsedData, currentVisualization, setVisualization } = useAppStore();

  if (!parsedData) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
          <Text>请先输入并解析文本，然后选择可视化模板</Text>
        </div>
      </Card>
    );
  }

  const handleSelect = (type: VisualizationType) => {
    setVisualization(type);
  };

  return (
    <Card title="选择可视化模板" style={{ marginBottom: 24 }}>
      <Row gutter={[16, 16]}>
        {TEMPLATES.map((template) => (
          <Col xs={24} sm={12} md={8} lg={6} key={template.type}>
            <Card
              hoverable
              className={`template-card ${currentVisualization === template.type ? 'selected' : ''}`}
              onClick={() => handleSelect(template.type)}
              style={{
                borderColor: currentVisualization === template.type ? template.color : '#d9d9d9',
                borderWidth: currentVisualization === template.type ? 2 : 1,
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    fontSize: 48,
                    color: template.color,
                    marginBottom: 12,
                  }}
                >
                  {template.icon}
                </div>
                <Title level={5} style={{ marginBottom: 8 }}>
                  {template.title}
                </Title>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {template.description}
                </Text>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </Card>
  );
};
