import React, { useState } from 'react';
import { Input, Button, Upload, Card, Space, message } from 'antd';
import { UploadOutlined, FileTextOutlined } from '@ant-design/icons';
import { useAppStore } from '../../store/useAppStore';
import { parseText } from '../../services/textParser';
import type { UploadFile } from 'antd';

const { TextArea } = Input;

export const TextInput: React.FC = () => {
  const [text, setText] = useState('');
  const { setRawText, setParsedData, setLoading, setError } = useAppStore();

  const handleParse = async () => {
    if (!text.trim()) {
      message.warning('请输入文本内容');
      return;
    }

    setLoading(true);
    try {
      const parsedData = await parseText(text);
      setRawText(text);
      setParsedData(parsedData);
      message.success('文本解析成功！');
    } catch (error: any) {
      setError(error.message || '解析失败');
      message.error(error.message || '解析失败');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: UploadFile) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      const content = e.target?.result as string;
      setText(content);
      message.success('文件上传成功！');
    };

    reader.onerror = () => {
      message.error('文件读取失败');
    };

    reader.readAsText(file as any);
    return false; // 阻止自动上传
  };

  const handleExampleText = () => {
    const exampleText = `人工智能的发展历程

2012年，深度学习技术取得重大突破，AlexNet在ImageNet竞赛中大放异彩。这标志着人工智能进入了新的发展阶段。

2016年3月，AlphaGo战胜世界围棋冠军李世石，震惊全球。这次胜利展示了人工智能在复杂策略游戏中的强大能力。

2017年，Transformer架构被提出，彻底改变了自然语言处理领域。基于Transformer的模型如BERT、GPT等相继问世。

2020年，GPT-3发布，展现了惊人的语言理解和生成能力。这个拥有1750亿参数的模型可以完成各种复杂的语言任务。

2022年11月，ChatGPT正式发布，在短短5天内用户数突破100万。它的出色表现引发了全球对生成式AI的广泛关注。

2023年，多模态大模型快速发展，AI技术开始向更广泛的应用场景渗透，包括医疗诊断、教育辅导、创意设计等领域。

未来，人工智能将继续深度融入人类社会，在提高生产效率、改善生活质量、推动科技创新等方面发挥更大作用。`;

    setText(exampleText);
    message.info('已加载示例文本');
  };

  return (
    <Card title="文本输入" style={{ marginBottom: 24 }}>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <TextArea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="请输入或粘贴文本内容，支持中英文混合..."
          rows={12}
          style={{ fontSize: 14 }}
        />

        <Space wrap>
          <Button type="primary" icon={<FileTextOutlined />} onClick={handleParse} size="large">
            解析文本
          </Button>

          <Upload beforeUpload={handleFileUpload} accept=".txt,.md" showUploadList={false}>
            <Button icon={<UploadOutlined />} size="large">
              上传文件
            </Button>
          </Upload>

          <Button onClick={handleExampleText} size="large">
            加载示例
          </Button>
        </Space>

        <div style={{ fontSize: 12, color: '#999' }}>
          支持格式：纯文本、Markdown | 自动识别：关键词、日期、事件、统计信息
        </div>
      </Space>
    </Card>
  );
};
