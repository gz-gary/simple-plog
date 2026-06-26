import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Table,
  Button,
  Popconfirm,
  Modal,
  Form,
  Input,
  message,
  Typography,
  Empty,
  Space,
  Grid,
} from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useAdmin } from './AdminContext'
import { getDisplayCities, getDisplayDate } from '../../types'
import type { Plog } from '../../types'

const { Text } = Typography
const { useBreakpoint } = Grid

export default function PlogList() {
  const { plogs, addPlog, deletePlog } = useAdmin()
  const navigate = useNavigate()
  const [addOpen, setAddOpen] = useState(false)
  const [form] = Form.useForm()
  const screens = useBreakpoint()
  const isMobile = !screens.md

  const handleAdd = () => {
    form.validateFields().then((values) => {
      const now = new Date().toISOString()
      const photoLines: string[] = (values.photoUrls ?? '')
        .split('\n')
        .map((s: string) => s.trim())
        .filter(Boolean)

      const newPlog: Plog = {
        id: `plog-${Date.now()}`,
        photos:
          photoLines.length > 0
            ? photoLines.map((url: string, i: number) => ({
                id: `p-${Date.now()}-${i}`,
                urls: { thumbnail: url, medium: url, original: url },
                takenAt: now,
                location: { city: values.city ?? '未标注' },
                caption: '',
              }))
            : [],
      }
      addPlog(newPlog)
      message.success('Plog 已添加')
      setAddOpen(false)
      form.resetFields()
    })
  }

  const columns = [
    {
      title: '首图',
      dataIndex: 'photos',
      key: 'thumbnail',
      width: isMobile ? 56 : 72,
      render: (photos: Plog['photos']) =>
        photos.length > 0 ? (
          <img
            src={photos[0].urls.thumbnail}
            alt=""
            style={{
              width: isMobile ? 36 : 48,
              height: isMobile ? 36 : 48,
              objectFit: 'cover',
              borderRadius: 4,
              background: '#F0EFEC',
            }}
          />
        ) : (
          <div
            style={{
              width: isMobile ? 36 : 48,
              height: isMobile ? 36 : 48,
              background: '#F0EFEC',
              borderRadius: 4,
            }}
          />
        ),
    },
    {
      title: '时间',
      key: 'date',
      width: 120,
      responsive: ['md' as const],
      render: (_: unknown, record: Plog) => {
        const d = getDisplayDate(record)
        return d || <Text type="secondary">-</Text>
      },
    },
    {
      title: '地点',
      key: 'cities',
      ellipsis: true,
      render: (_: unknown, record: Plog) => {
        const cities = getDisplayCities(record)
        return cities.length > 0 ? cities.join('、') : <Text type="secondary">-</Text>
      },
    },
    {
      title: '照片数',
      dataIndex: 'photos',
      key: 'count',
      width: 76,
      responsive: ['lg' as const],
      render: (photos: Plog['photos']) => photos.length,
    },
    {
      title: '操作',
      key: 'actions',
      width: isMobile ? 120 : 160,
      render: (_: unknown, record: Plog) => (
        <Space size={0} onClick={(e) => e.stopPropagation()}>
          <Button
            type="link"
            size={isMobile ? 'small' : undefined}
            onClick={() => navigate(`/admin/plogs/${record.id}`)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除这个 Plog？"
            description="此操作不可恢复"
            onConfirm={() => {
              deletePlog(record.id)
              message.success('已删除')
            }}
          >
            <Button type="link" danger size={isMobile ? 'small' : undefined}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: isMobile ? 16 : 24,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <Text
          strong
          style={{
            fontSize: isMobile ? 18 : 22,
          }}
        >
          Plog 列表
        </Text>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setAddOpen(true)}
          size={isMobile ? 'middle' : undefined}
        >
          新建 Plog
        </Button>
      </div>

      {/* Table */}
      {plogs.length === 0 ? (
        <Empty description="还没有 Plog" style={{ marginTop: isMobile ? 48 : 80 }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddOpen(true)}>
            新建第一个
          </Button>
        </Empty>
      ) : (
        <Table
          dataSource={plogs}
          columns={columns}
          rowKey="id"
          pagination={false}
          scroll={{ x: 'max-content' }}
          onRow={(record) => ({
            onClick: () => navigate(`/admin/plogs/${record.id}`),
            style: { cursor: 'pointer' },
          })}
          style={{ background: 'transparent' }}
          size={isMobile ? 'small' : undefined}
        />
      )}

      {/* Add modal */}
      <Modal
        title="新建 Plog"
        open={addOpen}
        onOk={handleAdd}
        onCancel={() => {
          setAddOpen(false)
          form.resetFields()
        }}
        destroyOnClose
        width={isMobile ? '100%' : undefined}
        style={isMobile ? { top: 16, maxWidth: 400 } : undefined}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="city"
            label="拍摄城市"
            rules={[{ required: true, message: '请填写城市' }]}
          >
            <Input placeholder="例如：南京" />
          </Form.Item>
          <Form.Item
            name="photoUrls"
            label="图片 URL（每行一张）"
            help="每行一个图片链接，至少填写一个"
            rules={[{ required: true, message: '请至少填写一个图片 URL' }]}
          >
            <Input.TextArea rows={4} placeholder="https://picsum.photos/200/200?random=1" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
