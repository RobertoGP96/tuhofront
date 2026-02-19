import {
    DashboardOutlined,
    DownOutlined,
    FileTextOutlined,
    RightOutlined,
    SettingOutlined,
    TeamOutlined,
} from '@ant-design/icons';
import { Layout, Menu, type MenuProps, theme } from 'antd';
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const { Sider } = Layout;

type MenuItem = Required<MenuProps>['items'][number];

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[],
  type?: 'group',
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
    type,
  } as MenuItem;
}

export const TeachingSecretarySidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [openKeys, setOpenKeys] = useState<string[]>(['procedures']);
  const navigate = useNavigate();
  const location = useLocation();
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const items: MenuItem[] = [
    getItem('Dashboard', 'dashboard', <DashboardOutlined />),
    {
      key: 'procedures',
      icon: <FileTextOutlined />,
      label: 'Trámites',
      children: [
        getItem('Gestión de Trámites', 'procedures/management'),
      ],
    },
    getItem('Personal', 'personal', <TeamOutlined />),
    getItem('Configuración', 'config', <SettingOutlined />),
  ];

  const onOpenChange: MenuProps['onOpenChange'] = (keys) => {
    const latestOpenKey = keys.find((key) => openKeys.indexOf(key) === -1);
    if (latestOpenKey) {
      setOpenKeys([latestOpenKey as string]);
    } else {
      setOpenKeys([]);
    }
  };

  const onClick: MenuProps['onClick'] = (e) => {
    const path = e.keyPath.reverse().join('/');
    navigate(`/admin/secretary/${path}`);
  };

  const getSelectedKeys = () => {
    const path = location.pathname;
    if (path.includes('procedures')) return ['procedures/management'];
    if (path.includes('personal')) return ['personal'];
    if (path.includes('config')) return ['config'];
    return ['dashboard'];
  };

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={(value) => setCollapsed(value)}
      width={250}
      style={{
        overflow: 'auto',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        backgroundColor: colorBgContainer,
      }}
    >
      <div style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)' }}>
        <h2 style={{ color: 'white', textAlign: 'center', margin: 0, lineHeight: '32px' }}>
          {!collapsed ? 'Secretaría Docente' : 'S.D.'}
        </h2>
      </div>
      <Menu
        theme="dark"
        mode="inline"
        defaultSelectedKeys={['1']}
        selectedKeys={getSelectedKeys()}
        openKeys={openKeys}
        onOpenChange={onOpenChange}
        onClick={onClick}
        items={items}
        expandIcon={({ isOpen }) =>
          isOpen ? <DownOutlined style={{ fontSize: 12 }} /> : <RightOutlined style={{ fontSize: 12 }} />
        }
      />
    </Sider>
  );
}
