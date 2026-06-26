import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import './index.css'
import App from './App.tsx'
import AdminLayout from './pages/admin/AdminLayout.tsx'
import PlogList from './pages/admin/PlogList.tsx'
import PlogEditor from './pages/admin/PlogEditor.tsx'

const theme = {
  token: {
    colorPrimary: '#C47E4F',
    colorBgContainer: '#FAFAF8',
    colorBgElevated: '#FFFFFF',
    borderRadius: 6,
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    colorText: '#1A1A1A',
    colorTextSecondary: '#6B6B6B',
    colorBorder: '#D6D5D1',
    colorBgLayout: '#FAFAF8',
  },
}

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <ConfigProvider theme={theme}>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<PlogList />} />
          <Route path="plogs" element={<PlogList />} />
          <Route path="plogs/:id" element={<PlogEditor />} />
        </Route>
      </Routes>
    </ConfigProvider>
  </BrowserRouter>,
)
