import { useState } from 'react'
import { Modal, Input, Button, Typography } from 'antd'
import { KeyOutlined } from '@ant-design/icons'

const { Text } = Typography

interface TokenGateProps {
  open: boolean
  onPass: () => void
}

export default function TokenGate({ open, onPass }: TokenGateProps) {
  const [token, setToken] = useState('')

  const handleConfirm = () => {
    onPass()
  }

  return (
    <Modal
      open={open}
      title={null}
      closable={false}
      footer={null}
      centered
      width={400}
      destroyOnClose
    >
      <div style={{ textAlign: 'center', padding: '24px 0' }}>
        <KeyOutlined style={{ fontSize: 48, color: '#C47E4F', marginBottom: 16 }} />
        <Text strong style={{ fontSize: 18, display: 'block', marginBottom: 8 }}>
          访问令牌
        </Text>
        <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
          请输入管理后台访问令牌以继续
        </Text>
        <Input.Password
          placeholder="输入令牌测试阶段可直接点击确认"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          onPressEnter={handleConfirm}
          style={{ marginBottom: 16 }}
          size="large"
        />
        <Button type="primary" block size="large" onClick={handleConfirm}>
          确认
        </Button>
      </div>
    </Modal>
  )
}
