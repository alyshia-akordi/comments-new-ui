import { useState } from 'react'
import { Avatar, Typography, Button, Space, Modal, Image } from 'antd'
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import UnderlineExt from '@tiptap/extension-underline'
import { Paperclip, Pencil, Trash2, Check, X, Bold, Italic, Underline, Strikethrough, List, ListOrdered, Download } from 'lucide-react'

export interface Comment {
  id: string
  author: string
  initials: string
  isYou?: boolean
  timestamp: string
  edited?: boolean
  deleted?: boolean
  contentHtml: string
  attachments?: { name: string; size: number; url: string; type?: string }[]
}

interface CommentItemProps {
  comment: Comment
  onEdit?: (id: string, newHtml: string, attachments?: Comment['attachments']) => void
  onDelete?: (id: string) => void
  onUndo?: (id: string) => void
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function EditEditor({ initialHtml, onSave, onCancel, attachments: initialAttachments }: {
  initialHtml: string
  onSave: (html: string, attachments: Comment['attachments']) => void
  onCancel: () => void
  attachments?: Comment['attachments']
}) {
  const [attachments, setAttachments] = useState(initialAttachments ?? [])
  const [isDragging, setIsDragging] = useState(false)

  const editor = useEditor({
    extensions: [StarterKit, UnderlineExt],
    content: initialHtml,
  })

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    Array.from(e.dataTransfer.files).forEach((file) => {
      setAttachments((prev) => [...prev, {
        name: file.name,
        size: file.size,
        url: URL.createObjectURL(file),
        type: file.type,
      }])
    })
  }

  if (!editor) return null

  return (
    <div
      className={`comment-edit-editor${isDragging ? ' is-dragging' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
      onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragging(false) }}
      onDrop={handleDrop}
    >
      <BubbleMenu editor={editor} tippyOptions={{ duration: 100, placement: 'top' }}>
        <div className="bubble-menu">
          <button
            className={`bubble-btn${editor.isActive('bold') ? ' is-active' : ''}`}
            onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleBold().run() }}
          ><Bold size={13} /></button>
          <button
            className={`bubble-btn${editor.isActive('italic') ? ' is-active' : ''}`}
            onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleItalic().run() }}
          ><Italic size={13} /></button>
          <button
            className={`bubble-btn${editor.isActive('underline') ? ' is-active' : ''}`}
            onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleUnderline().run() }}
          ><Underline size={13} /></button>
          <button
            className={`bubble-btn${editor.isActive('strike') ? ' is-active' : ''}`}
            onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleStrike().run() }}
          ><Strikethrough size={13} /></button>
          <span className="bubble-divider" />
          <button
            className={`bubble-btn${editor.isActive('bulletList') ? ' is-active' : ''}`}
            onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleBulletList().run() }}
          ><List size={13} /></button>
          <button
            className={`bubble-btn${editor.isActive('orderedList') ? ' is-active' : ''}`}
            onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleOrderedList().run() }}
          ><ListOrdered size={13} /></button>
        </div>
      </BubbleMenu>
      <EditorContent editor={editor} className="comment-edit-content" />
      {attachments.length > 0 && (() => {
        const images = attachments.filter((f) => f.type?.startsWith('image/'))
        const files = attachments.filter((f) => !f.type?.startsWith('image/'))
        return (
          <div className="comment-edit-attachments">
            {images.length > 0 && (
              <div className="image-attachment-grid" style={{ padding: '6px 12px 0' }}>
                {images.map((file, i) => (
                  <div key={i} className="image-thumb-wrapper">
                    <img
                      src={file.url}
                      width={72}
                      height={72}
                      style={{ objectFit: 'cover', borderRadius: 6, display: 'block', width: 72, height: 72 }}
                    />
                    <div className="image-thumb-overlay">
                      <Trash2
                        size={14}
                        className="thumb-action-icon thumb-delete"
                        onClick={() => setAttachments((prev) => prev.filter((f) => f !== file))}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
            {files.length > 0 && (
              <div className="comment-attachments" style={{ padding: '6px 12px 0' }}>
                {files.map((file, i) => (
                  <div key={i} className="comment-attachment-item">
                    <Paperclip size={13} className="comment-attachment-icon" />
                    <span className="comment-attachment-name">{file.name}</span>
                    <button
                      className="comment-attachment-delete-btn"
                      onClick={() => setAttachments((prev) => prev.filter((_, j) => j !== i))}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })()}
      <div className="comment-edit-actions">
        <Button size="small" onClick={onCancel} icon={<X size={12} />}>Cancel</Button>
        <Button
          size="small"
          type="primary"
          icon={<Check size={12} />}
          style={{ backgroundColor: '#7c6fcd', borderColor: '#7c6fcd' }}
          onClick={() => onSave(editor.getHTML(), attachments)}
        >
          Save
        </Button>
      </div>
    </div>
  )
}

export default function CommentItem({ comment, onEdit, onDelete, onUndo }: CommentItemProps) {
  const [editing, setEditing] = useState(false)

  const handleDelete = () => {
    Modal.confirm({
      title: 'Delete comment',
      content: 'Are you sure you want to delete this comment?',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: () => onDelete?.(comment.id),
    })
  }

  return (
    <div className="comment-item">
      <div className="comment-header">
        <div className="comment-author">
          <Avatar size="small" style={{ backgroundColor: '#7c6fcd', fontSize: 12, fontWeight: 600, flexShrink: 0 }}>
            {comment.initials}
          </Avatar>
          <Typography.Text strong style={{ fontSize: 14 }}>
            {comment.author}
            {comment.isYou && (
              <Typography.Text type="secondary" style={{ fontWeight: 400, marginLeft: 4 }}>(you)</Typography.Text>
            )}
          </Typography.Text>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Typography.Text type="secondary" style={{ fontSize: 13, whiteSpace: 'nowrap' }}>
            {comment.timestamp}
          </Typography.Text>
          {comment.edited && (
            <Typography.Text type="secondary" style={{ fontSize: 12, fontStyle: 'italic' }}>Edited</Typography.Text>
          )}
        </div>
      </div>

      {comment.deleted && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Typography.Text type="secondary" style={{ fontStyle: 'italic', fontSize: 14 }}>
            This comment was removed
          </Typography.Text>
          <Button type="link" size="small" style={{ padding: 0, fontSize: 13 }} onClick={() => onUndo?.(comment.id)}>
            Undo
          </Button>
        </div>
      )}

      {!comment.deleted && <div className="comment-body-wrapper">
        {comment.isYou && !editing && (
          <div className="comment-actions">
            <Space size={2}>
              <Button
                type="text"
                size="small"
                icon={<Pencil size={13} />}
                className="comment-action-btn"
                onClick={() => setEditing(true)}
              />
              <Button
                type="text"
                size="small"
                icon={<Trash2 size={13} />}
                className="comment-action-btn comment-action-delete"
                onClick={handleDelete}
              />
            </Space>
          </div>
        )}

        {editing ? (
          <EditEditor
            initialHtml={comment.contentHtml}
            attachments={comment.attachments}
            onSave={(html, attachments) => { onEdit?.(comment.id, html, attachments); setEditing(false) }}
            onCancel={() => setEditing(false)}
          />
        ) : (
          <div className="comment-body">
            <div dangerouslySetInnerHTML={{ __html: comment.contentHtml }} />
            {comment.attachments && comment.attachments.length > 0 && (() => {
              const images = comment.attachments.filter((f) => f.type?.startsWith('image/'))
              const files = comment.attachments.filter((f) => !f.type?.startsWith('image/'))
              return (
                <>
                  {images.length > 0 && (
                    <div className="image-attachment-grid" style={{ marginTop: 8 }}>
                      <Image.PreviewGroup items={images.map((f) => f.url)}>
                        {images.map((file, i) => (
                          <Image
                            key={i}
                            src={file.url}
                            width={72}
                            height={72}
                            style={{ objectFit: 'cover', borderRadius: 6 }}
                            preview={{ mask: false }}
                          />
                        ))}
                      </Image.PreviewGroup>
                    </div>
                  )}
                  {files.length > 0 && (
                    <div className="comment-attachments">
                      {files.map((file, i) => (
                        <div key={i} className="comment-attachment-item">
                          <Paperclip size={13} className="comment-attachment-icon" />
                          <span className="comment-attachment-name">{file.name}</span>
                          <a
                            href={file.url}
                            download={file.name}
                            className="comment-attachment-download"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Download size={13} />
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )
            })()}
          </div>
        )}
      </div>}
    </div>
  )
}
