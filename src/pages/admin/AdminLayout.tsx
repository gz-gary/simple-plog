import { useState } from 'react'
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom'
import { Layout, Menu, Typography, Drawer, Grid, Button } from 'antd'
import { PictureOutlined, ArrowLeftOutlined, MenuOutlined } from '@ant-design/icons'
import TokenGate from './TokenGate'
import { AdminProvider } from './AdminContext'
import { mockPlogs } from '../../data/mock'

const { Sider, Content, Header } = Layout
const { Text } = Typography
const { useBreakpoint } = Grid

const menuItems = [
  { key: '/admin/plogs', icon: <PictureOutlined />, label: 'Plog 列表' },
]

export default function AdminLayout() {
  const [tokenPassed, setTokenPassed] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const screens = useBreakpoint()
  const isMobile = !screens.lg

  if (!tokenPassed) {
    return <TokenGate open={!tokenPassed} onPass={() => setTokenPassed(true)} />
  }

  const selectedKey =
    location.pathname === '/admin' ? '/admin/plogs' : location.pathname

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key)
    if (isMobile) setDrawerOpen(false)
  }

  // Common nav content
  const navMenu = (
    <Menu
      mode="inline"
      selectedKeys={[selectedKey]}
      items={menuItems}
      onClick={handleMenuClick}
      style={{ background: 'transparent', borderInlineEnd: 'none', marginTop: 8 }}
    />
  )

  const navFooter = (
    <div style={{ borderTop: '1px solid #D6D5D1', padding: 16 }}>
      <Link
        to="/"
        style={{ color: '#6B6B6B', fontSize: 13, textDecoration: 'none' }}
      >
        <ArrowLeftOutlined style={{ marginRight: 6 }} />
        返回主页
      </Link>
    </div>
  )

  const brand = (
    <Text
      strong
      style={{
        fontSize: 18,
        fontFamily: 'Cormorant Garamond, serif',
        fontStyle: 'italic',
        letterSpacing: '0.05em',
        color: '#1A1A1A',
      }}
    >
      plog · 管理
    </Text>
  )

  return (
    <AdminProvider initial={mockPlogs}>
      <Layout style={{ minHeight: '100vh', background: '#FAFAF8' }}>
        {/* ── Desktop sidebar ── */}
        {!isMobile && (
          <Sider
            theme="light"
            width={220}
            style={{
              background: '#FAFAF8',
              borderRight: '1px solid #D6D5D1',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ padding: '20px 16px', borderBottom: '1px solid #D6D5D1' }}>
              {brand}
            </div>
            {navMenu}
            <div style={{ flex: 1 }} />
            {navFooter}
          </Sider>
        )}

        {/* ── Mobile top bar ── */}
        {isMobile && (
          <Header
            style={{
              background: '#FAFAF8',
              borderBottom: '1px solid #D6D5D1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 12px',
              height: 52,
              position: 'sticky',
              top: 0,
              zIndex: 100,
            }}
          >
            <Button
              type="text"
              icon={<MenuOutlined style={{ fontSize: 20 }} />}
              onClick={() => setDrawerOpen(true)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            />
            {brand}
            <div style={{ width: 32 }} />
          </Header>
        )}

        {/* ── Mobile drawer ── */}
        <Drawer
          title={brand}
          placement="left"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          width={260}
          styles={{ body: { padding: 0, display: 'flex', flexDirection: 'column' } }}
        >
          {navMenu}
          <div style={{ flex: 1 }} />
          {navFooter}
        </Drawer>

        {/* ── Content ── */}
        <Layout style={{ background: '#FAFAF8' }}>
          <Content
            style={{
              padding: isMobile ? '20px 16px' : '32px 40px',
              maxWidth: 960,
              minHeight: isMobile ? 'calc(100vh - 52px)' : '100vh',
            }}
          >
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </AdminProvider>
  )
}
