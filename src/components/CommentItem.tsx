import { useState } from 'react'
import { Avatar, Typography, Button, Space, Modal } from 'antd'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import UnderlineExt from '@tiptap/extension-underline'
import { Paperclip, Pencil, Trash2, Check, X } from 'lucide-react'

export interface Comment {
  id: string
  author: string
  initials: string
  isYou?: boolean
  timestamp: string
  edited?: boolean
  deleted?: boolean
  contentHtml: string
  attachments?: { name: string; size: number; url: string }[]
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

  const editor = useEditor({
    extensions: [StarterKit, UnderlineExt],
    content: initialHtml,
  })

  if (!editor) return null

  return (
    <div className="comment-edit-editor">
      <EditorContent editor={editor} className="comment-edit-content" />
      {attachments.length > 0 && (
        <div className="comment-attachments comment-edit-attachments">
          {attachments.map((file, i) => (
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
            {comment.attachments && comment.attachments.length > 0 && (
              <div className="comment-attachments">
                {comment.attachments.map((file, i) => (
                  <a
                    key={i}
                    href={file.url}
                    download={file.name}
                    className="comment-attachment-item"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Paperclip size={13} className="comment-attachment-icon" />
                    <span className="comment-attachment-name">{file.name}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        )}
      </div>}
    </div>
  )
}
