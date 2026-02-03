import React from 'react';
import { Card, Empty } from 'antd';
import ReactFlow, {
  type Node,
  type Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useAppStore } from '../../../store/useAppStore';

export const FlowchartVisualization: React.FC = () => {
  const { parsedData, visualizationConfig } = useAppStore();

  if (!parsedData || parsedData.events.length === 0) {
    return (
      <Card>
        <Empty description="没有足够的事件数据来生成流程图" />
      </Card>
    );
  }

  // 将事件转换为流程图节点
  const initialNodes: Node[] = parsedData.events.slice(0, 10).map((event, index) => ({
    id: event.id,
    type: 'default',
    position: { x: 250, y: index * 150 },
    data: { label: event.title },
    style: {
      background: visualizationConfig?.colors?.[index % 5] || '#1890ff',
      color: 'white',
      border: 'none',
      borderRadius: 8,
      padding: 10,
      width: 200,
    },
  }));

  // 创建简单的顺序连接
  const initialEdges: Edge[] = parsedData.events.slice(0, 9).map((_, index) => ({
    id: `e${index}`,
    source: parsedData.events[index].id,
    target: parsedData.events[index + 1].id,
    animated: true,
    style: { stroke: '#999' },
  }));

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  return (
    <Card title={visualizationConfig?.title || '流程图可视化'}>
      <div style={{ height: 600, background: '#f5f5f5' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>
      <div style={{ marginTop: 12, color: '#999', fontSize: 12 }}>
        拖动节点可以调整布局，滚动鼠标可以缩放
      </div>
    </Card>
  );
};
