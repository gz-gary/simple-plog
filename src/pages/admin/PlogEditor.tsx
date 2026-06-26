import { useState, useCallback, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Button,
  Typography,
  Input,
  DatePicker,
  Modal,
  Form,
  message,
  Empty,
  Space,
  Tag,
  Divider,
  Tooltip,
  Grid,
} from 'antd'
import {
  ArrowLeftOutlined,
  PlusOutlined,
  DeleteOutlined,
  MenuOutlined,
  SaveOutlined,
  FileTextOutlined,
} from '@ant-design/icons'
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useAdmin } from './AdminContext'
import { getDisplayCities, getDisplayDate } from '../../types'
import type { Photo, Plog } from '../../types'
import dayjs from 'dayjs'

const { Text } = Typography
const { TextArea } = Input
const { useBreakpoint } = Grid

/* ---------- helpers ---------- */

const ISO_DATE_FMT = 'YYYY-MM-DD HH:mm:ss'

function toDayjs(iso: string) {
  const d = dayjs(iso)
  return d.isValid() ? d : null
}

function fromDayjs(d: dayjs.Dayjs | null) {
  return d?.toISOString() ?? new Date().toISOString()
}

/* ---------- Sortable photo card ---------- */

interface PhotoCardProps {
  photo: Photo
  onChange: (id: string, patch: Partial<Photo>) => void
  onDelete: (id: string) => void
}

function SortablePhotoCard({ photo, onChange, onDelete }: PhotoCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: photo.id })

  const screens = useBreakpoint()
  const isMobile = !screens.md

  const [captionModalOpen, setCaptionModalOpen] = useState(false)
  const [draftCaption, setDraftCaption] = useState('')

  const openCaptionModal = () => {
    setDraftCaption(photo.caption)
    setCaptionModalOpen(true)
  }

  const confirmCaption = () => {
    onChange(photo.id, { caption: draftCaption })
    setCaptionModalOpen(false)
  }

  const style: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: isMobile ? 10 : 16,
    padding: isMobile ? 10 : 16,
    marginBottom: 8,
    background: '#FFFFFF',
    border: '1px solid #D6D5D1',
    borderRadius: 8,
    opacity: isDragging ? 0.35 : 1,
    transform: CSS.Transform.toString(transform),
    transition,
    position: 'relative',
    zIndex: isDragging ? 1 : 'auto',
  }

  const thumbSize = isMobile ? 60 : 80

  return (
    <>
      <div ref={setNodeRef} style={style}>
        {/* Drag handle */}
        <div
          {...listeners}
          {...attributes}
          style={{
            display: 'flex',
            alignItems: 'center',
            color: '#6B6B6B',
            cursor: 'grab',
            touchAction: 'none',
            userSelect: 'none',
          }}
        >
          <MenuOutlined />
        </div>

        {/* Thumbnail */}
        <img
          src={photo.urls.thumbnail}
          alt=""
          style={{
            width: thumbSize,
            height: thumbSize,
            objectFit: 'cover',
            borderRadius: 4,
            flexShrink: 0,
            background: '#F0EFEC',
          }}
        />

        {/* Editable fields */}
        <div style={{ flex: 1, alignSelf: 'stretch', display: 'flex', flexDirection: 'column', gap: isMobile ? 6 : 10 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr',
              gap: isMobile ? 6 : 12,
            }}
          >
            <div>
              <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 2 }}>
                拍摄地点
              </Text>
              <Input
                value={photo.location.city}
                placeholder="城市"
                onChange={(e) =>
                  onChange(photo.id, {
                    location: { ...photo.location, city: e.target.value },
                  })
                }
              />
            </div>
            <div>
              <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 2 }}>
                具体地点
              </Text>
              <Input
                value={photo.location.place ?? ''}
                placeholder="可选"
                onChange={(e) =>
                  onChange(photo.id, {
                    location: { ...photo.location, place: e.target.value },
                  })
                }
              />
            </div>
            <div>
              <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 2 }}>
                拍摄时间
              </Text>
              <DatePicker
                showTime={{ format: 'HH:mm:ss', defaultValue: dayjs('00:00:00', 'HH:mm:ss') }}
                format={ISO_DATE_FMT}
                value={toDayjs(photo.takenAt)}
                onChange={(d) => onChange(photo.id, { takenAt: fromDayjs(d) })}
                style={{ width: '100%' }}
                allowClear={false}
              />
            </div>
          </div>
          <div>
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 2 }}>
              配文
            </Text>
            <div style={{ display: 'flex', gap: 8, alignItems: 'stretch' }}>
              <Input
                value={photo.caption}
                placeholder="写点什么…"
                onChange={(e) => onChange(photo.id, { caption: e.target.value })}
                style={{ flex: 1 }}
              />
              <Tooltip title="展开编辑">
                <Button
                  icon={<FileTextOutlined />}
                  onClick={openCaptionModal}
                />
              </Tooltip>
            </div>
          </div>
        </div>

        {/* Delete */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title="删除此照片">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => onDelete(photo.id)}
            />
          </Tooltip>
        </div>
      </div>

      {/* Caption editor modal — fixed-size, scrollable textarea */}
      <Modal
        title="编辑配文"
        open={captionModalOpen}
        onOk={confirmCaption}
        onCancel={() => setCaptionModalOpen(false)}
        destroyOnClose
        width={520}
      >
        <TextArea
          value={draftCaption}
          onChange={(e) => setDraftCaption(e.target.value)}
          rows={6}
          style={{ resize: 'none' }}
          placeholder="写点什么…"
        />
      </Modal>
    </>
  )
}

/* ---------- Drag overlay card (floating ghost) ---------- */

function DragOverlayCard({ photo }: { photo: Photo }) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 16,
        padding: 16,
        background: '#FFFFFF',
        border: '1px solid #C47E4F',
        borderRadius: 8,
        boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
        rotate: '2deg',
        width: '100%',
        pointerEvents: 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', color: '#6B6B6B' }}>
        <MenuOutlined />
      </div>
      <img
        src={photo.urls.thumbnail}
        alt=""
        style={{
          width: 80,
          height: 80,
          objectFit: 'cover',
          borderRadius: 4,
          flexShrink: 0,
          background: '#F0EFEC',
        }}
      />
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 4,
        }}
      >
        <Text style={{ fontSize: 13, color: '#6B6B6B' }}>
          {photo.location.city}
        </Text>
        <Text style={{ fontSize: 12, color: '#6B6B6B' }}>
          {toDayjs(photo.takenAt)?.format(ISO_DATE_FMT)}
        </Text>
        <Text
          style={{
            fontSize: 12,
            color: '#6B6B6B',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: 300,
          }}
        >
          {photo.caption || '无配文'}
        </Text>
      </div>
    </div>
  )
}

/* ---------- Add photo modal ---------- */

interface AddPhotoModalProps {
  open: boolean
  onClose: () => void
  onAdd: (photo: Photo) => void
}

function AddPhotoModal({ open, onClose, onAdd }: AddPhotoModalProps) {
  const [form] = Form.useForm()
  const [captionModalOpen, setCaptionModalOpen] = useState(false)
  const [captionDraft, setCaptionDraft] = useState('')

  const openCaptionEdit = () => {
    setCaptionDraft(form.getFieldValue('caption') ?? '')
    setCaptionModalOpen(true)
  }

  const confirmCaptionEdit = () => {
    form.setFieldsValue({ caption: captionDraft })
    setCaptionModalOpen(false)
  }

  const handleOk = () => {
    form.validateFields().then((values) => {
      const now = new Date().toISOString()
      const url: string = (values.url ?? '').trim()
      const photo: Photo = {
        id: `p-${Date.now()}`,
        urls: { thumbnail: url, medium: url, original: url },
        takenAt: values.takenAt ? values.takenAt.toISOString() : now,
        location: { city: values.city ?? '未标注', place: values.place || undefined },
        caption: values.caption ?? '',
      }
      onAdd(photo)
      form.resetFields()
      onClose()
    })
  }

  return (
    <>
      <Modal
        title="添加照片"
        open={open}
        onOk={handleOk}
        onCancel={() => { onClose(); form.resetFields() }}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="url" label="图片 URL" rules={[{ required: true, message: '请填写图片链接' }]}>
            <Input placeholder="https://picsum.photos/200/200?random=1" />
          </Form.Item>
          <Form.Item name="city" label="拍摄城市" rules={[{ required: true, message: '请填写城市' }]}>
            <Input placeholder="例如：南京" />
          </Form.Item>
          <Form.Item name="place" label="具体地点">
            <Input placeholder="可选" />
          </Form.Item>
          <Form.Item
            name="takenAt"
            label="拍摄时间"
            initialValue={dayjs()}
            rules={[{ required: true, message: '请选择拍摄时间' }]}
          >
            <DatePicker
              showTime={{ format: 'HH:mm:ss', defaultValue: dayjs('00:00:00', 'HH:mm:ss') }}
              format={ISO_DATE_FMT}
              style={{ width: '100%' }}
            />
          </Form.Item>
          <Form.Item name="caption" label="配文">
            <div style={{ display: 'flex', gap: 8, alignItems: 'stretch' }}>
              <Input placeholder="写点什么…" style={{ flex: 1 }} />
              <Tooltip title="展开编辑">
                <Button icon={<FileTextOutlined />} onClick={openCaptionEdit} />
              </Tooltip>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      {/* Caption editor modal */}
      <Modal
        title="编辑配文"
        open={captionModalOpen}
        onOk={confirmCaptionEdit}
        onCancel={() => setCaptionModalOpen(false)}
        destroyOnClose
        width={520}
      >
        <TextArea
          value={captionDraft}
          onChange={(e) => setCaptionDraft(e.target.value)}
          rows={6}
          style={{ resize: 'none' }}
          placeholder="写点什么…"
        />
      </Modal>
    </>
  )
}

/* ---------- PlogEditor ---------- */

export default function PlogEditor() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getPlog, updatePlog, addPlog } = useAdmin()
  const screens = useBreakpoint()
  const isMobile = !screens.md
  const isNew = id === 'new'

  const [plog, setPlog] = useState<Plog | null>(() => {
    if (isNew) {
      return { id: '__new__', photos: [] }
    }
    const p = getPlog(id ?? '')
    return p ? JSON.parse(JSON.stringify(p)) : null
  })
  const [addOpen, setAddOpen] = useState(false)
  const [dirty, setDirty] = useState(false)

  // DnD — the photo being dragged (for overlay)
  const [activePhoto, setActivePhoto] = useState<Photo | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  )

  // Sync from context when id changes
  useEffect(() => {
    if (isNew) {
      setPlog({ id: '__new__', photos: [] })
      setDirty(false)
      return
    }
    const p = getPlog(id ?? '')
    if (p) {
      setPlog(JSON.parse(JSON.stringify(p)))
      setDirty(false)
    } else {
      setPlog(null)
    }
  }, [id, getPlog, isNew])

  const handlePhotoChange = useCallback(
    (photoId: string, patch: Partial<Photo>) => {
      setPlog((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          photos: prev.photos.map((ph) =>
            ph.id === photoId ? { ...ph, ...patch } : ph,
          ),
        }
      })
      setDirty(true)
    },
    [],
  )

  const handleDeletePhoto = useCallback((photoId: string) => {
    setPlog((prev) => {
      if (!prev) return prev
      return { ...prev, photos: prev.photos.filter((ph) => ph.id !== photoId) }
    })
    setDirty(true)
  }, [])

  const handleAddPhoto = useCallback((photo: Photo) => {
    setPlog((prev) => {
      if (!prev) return prev
      return { ...prev, photos: [...prev.photos, photo] }
    })
    setDirty(true)
    message.success('照片已添加')
  }, [])

  // ---- DnK-kit handlers ----
  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const photo = plog?.photos.find((p) => p.id === event.active.id) ?? null
      setActivePhoto(photo)
    },
    [plog],
  )

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setPlog((prev) => {
        if (!prev) return prev
        const oldIndex = prev.photos.findIndex((p) => p.id === active.id)
        const newIndex = prev.photos.findIndex((p) => p.id === over.id)
        if (oldIndex === -1 || newIndex === -1) return prev
        const arr = [...prev.photos]
        const [moved] = arr.splice(oldIndex, 1)
        arr.splice(newIndex, 0, moved)
        return { ...prev, photos: arr }
      })
      setDirty(true)
    }
    setActivePhoto(null)
  }, [])

  const handleDragCancel = useCallback(() => {
    setActivePhoto(null)
  }, [])

  // ---- Save ----
  const handleSave = () => {
    if (!plog) return

    if (isNew) {
      if (plog.photos.length === 0) {
        message.error('请至少添加一张照片')
        return
      }
      const realId = `plog-${Date.now()}`
      const created = { ...plog, id: realId }
      addPlog(created)
      setDirty(false)
      message.success('Plog 已创建')
      navigate(`/admin/plogs/${realId}`, { replace: true })
      return
    }

    updatePlog(plog)
    setDirty(false)
    message.success('已保存')
  }

  // ---- Not found ----
  if (!plog) {
    return (
      <Empty
        description="未找到该 Plog"
        style={{ marginTop: 80 }}
      >
        <Button onClick={() => navigate('/admin/plogs')}>
          返回列表
        </Button>
      </Empty>
    )
  }

  const displayDate = getDisplayDate(plog)
  const displayCities = getDisplayCities(plog)
  const photoIds = plog.photos.map((p) => p.id)

  return (
    <div>
      {/* Back + header */}
      <div style={{ marginBottom: isMobile ? 16 : 24 }}>
        <Button
          type="link"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/admin/plogs')}
          style={{ padding: 0, marginBottom: 8 }}
        >
          返回列表
        </Button>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'stretch' : 'flex-start',
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? 12 : 0,
          }}
        >
          <div>
            <Text strong style={{ fontSize: isMobile ? 18 : 22, display: 'block' }}>
              {isNew ? '新建 Plog' : (displayDate || '未设置时间')}
            </Text>
            {!isNew ? (
              <Space size={4} style={{ marginTop: 4 }}>
                {displayCities.map((c) => (
                  <Tag key={c} color="#C47E4F" style={{ borderRadius: 4 }}>
                    {c}
                  </Tag>
                ))}
                <Text type="secondary" style={{ fontSize: 13 }}>
                  {plog.photos.length} 张照片
                </Text>
              </Space>
            ) : (
              <Text type="secondary" style={{ fontSize: 13 }}>
                添加照片后即可创建 Plog
              </Text>
            )}
          </div>
          <Space
            style={{
              alignSelf: isMobile ? 'flex-end' : undefined,
            }}
          >
            {!isNew && dirty && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                有未保存的更改
              </Text>
            )}
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSave}
              disabled={!isNew && !dirty}
              size={isMobile ? 'middle' : undefined}
            >
              {isNew ? '创建' : '保存'}
            </Button>
          </Space>
        </div>
      </div>

      <Divider style={{ margin: '0 0 24px' }} />

      {/* Photo list */}
      <div style={{ marginBottom: 16 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
            flexWrap: 'wrap',
            gap: 8,
          }}
        >
          <Text strong style={{ fontSize: isMobile ? 15 : 16 }}>
            照片
          </Text>
          <Button icon={<PlusOutlined />} onClick={() => setAddOpen(true)} size={isMobile ? 'middle' : undefined}>
            添加照片
          </Button>
        </div>

        {plog.photos.length === 0 ? (
          <Empty
            description="此 Plog 暂无照片"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button icon={<PlusOutlined />} onClick={() => setAddOpen(true)}>
              添加照片
            </Button>
          </Empty>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
            <SortableContext items={photoIds} strategy={verticalListSortingStrategy}>
              {/* Drag hint */}
              {plog.photos.length > 1 && (
                <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>
                  拖动照片左侧 ≡ 手柄可调整顺序
                </Text>
              )}

              {plog.photos.map((photo) => (
                <SortablePhotoCard
                  key={photo.id}
                  photo={photo}
                  onChange={handlePhotoChange}
                  onDelete={handleDeletePhoto}
                />
              ))}
            </SortableContext>

            <DragOverlay>
              {activePhoto ? <DragOverlayCard photo={activePhoto} /> : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>

      {/* Add photo modal */}
      <AddPhotoModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdd={handleAddPhoto}
      />
    </div>
  )
}
