import { Layout, Typography, Space, Spin, Alert } from 'antd';
import { TextInput } from './components/TextInput';
import { TemplateSelector } from './components/TemplateSelector';
import { VisualizationContainer } from './components/Visualizations';
import { ExportPanel } from './components/ExportPanel';
import { useAppStore } from './store/useAppStore';
import './App.css';

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;

function App() {
  const { isLoading, error, currentVisualization } = useAppStore();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <Title level={2} style={{ color: 'white', margin: 0 }}>
          文本可视化工具
        </Title>
      </Header>

      <Content style={{ padding: '24px', background: '#f0f2f5' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <Spin spinning={isLoading} tip="处理中...">
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              {error && (
                <Alert
                  message="错误"
                  description={error}
                  type="error"
                  closable
                  showIcon
                />
              )}

              <TextInput />

              <TemplateSelector />

              {currentVisualization && (
                <>
                  <ExportPanel />
                  <VisualizationContainer />
                </>
              )}
            </Space>
          </Spin>
        </div>
      </Content>

      <Footer style={{ textAlign: 'center', background: '#fff' }}>
        <Text type="secondary">
          文本可视化工具 © 2026 | 支持词云、时间线、流程图、图表、思维导图、日历、照片墙
        </Text>
      </Footer>
    </Layout>
  );
}

export default App;
