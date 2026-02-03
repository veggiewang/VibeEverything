import React from 'react';
import { Card, Button, Space, message, Select } from 'antd';
import {
  DownloadOutlined,
  FileImageOutlined,
  FilePdfOutlined,
  FileTextOutlined,
  ShareAltOutlined,
} from '@ant-design/icons';
import { useAppStore } from '../../store/useAppStore';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const { Option } = Select;

export const ExportPanel: React.FC = () => {
  const { currentVisualization, parsedData, visualizationConfig } = useAppStore();
  const [exportFormat, setExportFormat] = React.useState<'png' | 'jpg' | 'pdf' | 'json'>('png');

  if (!currentVisualization || !parsedData) {
    return null;
  }

  const handleExportImage = async (format: 'png' | 'jpg') => {
    try {
      message.loading({ content: '正在导出...', key: 'export' });

      // 找到可视化容器
      const vizElement = document.querySelector('.ant-card') as HTMLElement;
      if (!vizElement) {
        throw new Error('找不到可视化元素');
      }

      // 使用 html2canvas 截图
      const canvas = await html2canvas(vizElement, {
        backgroundColor: '#ffffff',
        scale: 2, // 提高清晰度
      });

      // 转换为图片并下载
      const dataUrl = canvas.toDataURL(`image/${format}`);
      const link = document.createElement('a');
      link.download = `visualization-${Date.now()}.${format}`;
      link.href = dataUrl;
      link.click();

      message.success({ content: '导出成功！', key: 'export' });
    } catch (error) {
      console.error('导出错误:', error);
      message.error({ content: '导出失败，请重试', key: 'export' });
    }
  };

  const handleExportPDF = async () => {
    try {
      message.loading({ content: '正在生成 PDF...', key: 'export' });

      const vizElement = document.querySelector('.ant-card') as HTMLElement;
      if (!vizElement) {
        throw new Error('找不到可视化元素');
      }

      const canvas = await html2canvas(vizElement, {
        backgroundColor: '#ffffff',
        scale: 2,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height],
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`visualization-${Date.now()}.pdf`);

      message.success({ content: 'PDF 导出成功！', key: 'export' });
    } catch (error) {
      console.error('PDF 导出错误:', error);
      message.error({ content: 'PDF 导出失败，请重试', key: 'export' });
    }
  };

  const handleExportJSON = () => {
    try {
      const exportData = {
        visualization: currentVisualization,
        config: visualizationConfig,
        data: parsedData,
        exportTime: new Date().toISOString(),
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.download = `visualization-data-${Date.now()}.json`;
      link.href = url;
      link.click();

      URL.revokeObjectURL(url);
      message.success('数据导出成功！');
    } catch (error) {
      console.error('JSON 导出错误:', error);
      message.error('数据导出失败，请重试');
    }
  };

  const handleExport = () => {
    switch (exportFormat) {
      case 'png':
      case 'jpg':
        handleExportImage(exportFormat);
        break;
      case 'pdf':
        handleExportPDF();
        break;
      case 'json':
        handleExportJSON();
        break;
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: '文本可视化',
          text: '查看我的文本可视化作品',
          url: window.location.href,
        })
        .then(() => message.success('分享成功！'))
        .catch((error) => console.log('分享失败:', error));
    } else {
      // 复制链接到剪贴板
      navigator.clipboard.writeText(window.location.href).then(() => {
        message.success('链接已复制到剪贴板！');
      });
    }
  };

  return (
    <Card title="导出与分享" size="small" style={{ marginBottom: 16 }}>
      <Space wrap>
        <Select
          value={exportFormat}
          onChange={setExportFormat}
          style={{ width: 120 }}
        >
          <Option value="png">
            <FileImageOutlined /> PNG
          </Option>
          <Option value="jpg">
            <FileImageOutlined /> JPG
          </Option>
          <Option value="pdf">
            <FilePdfOutlined /> PDF
          </Option>
          <Option value="json">
            <FileTextOutlined /> JSON
          </Option>
        </Select>

        <Button type="primary" icon={<DownloadOutlined />} onClick={handleExport}>
          导出
        </Button>

        <Button icon={<ShareAltOutlined />} onClick={handleShare}>
          分享
        </Button>
      </Space>
    </Card>
  );
};
