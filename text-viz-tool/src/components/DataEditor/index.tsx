import React, { useState } from 'react';
import { Card, Tabs, Table, Button, Modal, Form, Input, DatePicker, InputNumber, message, Popconfirm, Space } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useAppStore } from '../../store/useAppStore';
import type { KeywordData, EventData } from '../../types';
import dayjs from 'dayjs';

const { TabPane } = Tabs;

export const DataEditor: React.FC = () => {
  const { parsedData, setParsedData } = useAppStore();
  const [isKeywordModalVisible, setIsKeywordModalVisible] = useState(false);
  const [isEventModalVisible, setIsEventModalVisible] = useState(false);
  const [editingKeyword, setEditingKeyword] = useState<KeywordData | null>(null);
  const [editingEvent, setEditingEvent] = useState<EventData | null>(null);
  const [keywordForm] = Form.useForm();
  const [eventForm] = Form.useForm();

  if (!parsedData) {
    return null;
  }

  // 关键词列表列
  const keywordColumns = [
    {
      title: '关键词',
      dataIndex: 'word',
      key: 'word',
      width: '40%',
    },
    {
      title: '出现次数',
      dataIndex: 'count',
      key: 'count',
      width: '25%',
    },
    {
      title: '权重',
      dataIndex: 'weight',
      key: 'weight',
      width: '20%',
      render: (weight: number) => weight.toFixed(2),
    },
    {
      title: '操作',
      key: 'action',
      width: '15%',
      render: (_: any, record: KeywordData) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditKeyword(record)}
          />
          <Popconfirm
            title="确定删除此关键词？"
            onConfirm={() => handleDeleteKeyword(record.word)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // 事件列表列
  const eventColumns = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      width: '35%',
    },
    {
      title: '内容',
      dataIndex: 'content',
      key: 'content',
      width: '35%',
      ellipsis: true,
    },
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
      width: '15%',
      render: (date: Date | undefined) =>
        date ? dayjs(date).format('YYYY-MM-DD') : '无',
    },
    {
      title: '操作',
      key: 'action',
      width: '15%',
      render: (_: any, record: EventData) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditEvent(record)}
          />
          <Popconfirm
            title="确定删除此事件？"
            onConfirm={() => handleDeleteEvent(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // 关键词操作
  const handleEditKeyword = (keyword: KeywordData) => {
    setEditingKeyword(keyword);
    keywordForm.setFieldsValue(keyword);
    setIsKeywordModalVisible(true);
  };

  const handleAddKeyword = () => {
    setEditingKeyword(null);
    keywordForm.resetFields();
    setIsKeywordModalVisible(true);
  };

  const handleKeywordModalOk = async () => {
    try {
      const values = await keywordForm.validateFields();
      const newKeywords = [...parsedData.keywords];

      if (editingKeyword) {
        // 编辑现有关键词
        const index = newKeywords.findIndex(k => k.word === editingKeyword.word);
        if (index !== -1) {
          newKeywords[index] = { ...values, weight: values.count / Math.max(...newKeywords.map(k => k.count)) };
        }
      } else {
        // 添加新关键词
        if (newKeywords.some(k => k.word === values.word)) {
          message.error('该关键词已存在');
          return;
        }
        newKeywords.push({ ...values, weight: values.count / Math.max(...newKeywords.map(k => k.count)) });
      }

      setParsedData({ ...parsedData, keywords: newKeywords });
      setIsKeywordModalVisible(false);
      message.success(editingKeyword ? '关键词已更新' : '关键词已添加');
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  const handleDeleteKeyword = (word: string) => {
    const newKeywords = parsedData.keywords.filter(k => k.word !== word);
    setParsedData({ ...parsedData, keywords: newKeywords });
    message.success('关键词已删除');
  };

  // 事件操作
  const handleEditEvent = (event: EventData) => {
    setEditingEvent(event);
    eventForm.setFieldsValue({
      ...event,
      date: event.date ? dayjs(event.date) : null,
    });
    setIsEventModalVisible(true);
  };

  const handleAddEvent = () => {
    setEditingEvent(null);
    eventForm.resetFields();
    setIsEventModalVisible(true);
  };

  const handleEventModalOk = async () => {
    try {
      const values = await eventForm.validateFields();
      const newEvents = [...parsedData.events];

      const eventData: EventData = {
        id: editingEvent?.id || `event-${Date.now()}`,
        title: values.title,
        content: values.content,
        date: values.date ? values.date.toDate() : undefined,
      };

      if (editingEvent) {
        // 编辑现有事件
        const index = newEvents.findIndex(e => e.id === editingEvent.id);
        if (index !== -1) {
          newEvents[index] = eventData;
        }
      } else {
        // 添加新事件
        newEvents.push(eventData);
      }

      // 按日期排序
      newEvents.sort((a, b) => {
        if (a.date && b.date) return a.date.getTime() - b.date.getTime();
        if (a.date && !b.date) return -1;
        if (!a.date && b.date) return 1;
        return 0;
      });

      setParsedData({ ...parsedData, events: newEvents });
      setIsEventModalVisible(false);
      message.success(editingEvent ? '事件已更新' : '事件已添加');
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  const handleDeleteEvent = (id: string) => {
    const newEvents = parsedData.events.filter(e => e.id !== id);
    setParsedData({ ...parsedData, events: newEvents });
    message.success('事件已删除');
  };

  return (
    <Card title="解析数据编辑器" style={{ marginBottom: 24 }}>
      <Tabs defaultActiveKey="keywords">
        <TabPane tab={`关键词 (${parsedData.keywords.length})`} key="keywords">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddKeyword}
            style={{ marginBottom: 16 }}
          >
            添加关键词
          </Button>
          <Table
            dataSource={parsedData.keywords}
            columns={keywordColumns}
            rowKey="word"
            pagination={{ pageSize: 10 }}
            size="small"
          />
        </TabPane>

        <TabPane tab={`事件 (${parsedData.events.length})`} key="events">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddEvent}
            style={{ marginBottom: 16 }}
          >
            添加事件
          </Button>
          <Table
            dataSource={parsedData.events}
            columns={eventColumns}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            size="small"
          />
        </TabPane>

        <TabPane tab="统计信息" key="statistics">
          <div style={{ padding: 16 }}>
            <p><strong>总字数：</strong>{parsedData.statistics.totalWords}</p>
            <p><strong>总字符数：</strong>{parsedData.statistics.totalCharacters}</p>
            <p><strong>总句子数：</strong>{parsedData.statistics.totalSentences}</p>
            <p><strong>独特词数：</strong>{parsedData.statistics.uniqueWords}</p>
            <p><strong>平均句长：</strong>{parsedData.statistics.averageWordsPerSentence.toFixed(2)} 词/句</p>
          </div>
        </TabPane>
      </Tabs>

      {/* 关键词编辑模态框 */}
      <Modal
        title={editingKeyword ? '编辑关键词' : '添加关键词'}
        open={isKeywordModalVisible}
        onOk={handleKeywordModalOk}
        onCancel={() => setIsKeywordModalVisible(false)}
      >
        <Form form={keywordForm} layout="vertical">
          <Form.Item
            label="关键词"
            name="word"
            rules={[{ required: true, message: '请输入关键词' }]}
          >
            <Input placeholder="请输入关键词" disabled={!!editingKeyword} />
          </Form.Item>
          <Form.Item
            label="出现次数"
            name="count"
            rules={[{ required: true, message: '请输入出现次数' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 事件编辑模态框 */}
      <Modal
        title={editingEvent ? '编辑事件' : '添加事件'}
        open={isEventModalVisible}
        onOk={handleEventModalOk}
        onCancel={() => setIsEventModalVisible(false)}
        width={600}
      >
        <Form form={eventForm} layout="vertical">
          <Form.Item
            label="标题"
            name="title"
            rules={[{ required: true, message: '请输入事件标题' }]}
          >
            <Input placeholder="请输入事件标题" />
          </Form.Item>
          <Form.Item
            label="内容"
            name="content"
            rules={[{ required: true, message: '请输入事件内容' }]}
          >
            <Input.TextArea rows={4} placeholder="请输入事件内容" />
          </Form.Item>
          <Form.Item label="日期" name="date">
            <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};
