import { Layout } from 'antd';
import type { ReactNode } from 'react';
import { TeachingSecretarySidebar } from './TeachingSecretarySidebar';

const { Content } = Layout;

interface TeachingSecretaryLayoutProps {
  children: ReactNode;
}

export function TeachingSecretaryLayout({ children }: TeachingSecretaryLayoutProps) {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <TeachingSecretarySidebar />
      <Layout>
        <Content style={{ margin: '24px 16px 0', overflow: 'initial' }}>
          <div style={{ padding: 24, backgroundColor: '#fff', minHeight: '100%' }}>
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
