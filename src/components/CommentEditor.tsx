import { useState, useCallback, useRef } from 'react'
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import UnderlineExt from '@tiptap/extension-underline'
import ImageExt from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import { Button, Tooltip, Upload, Image } from 'antd'
import type { UploadProps } from 'antd'
import { Paperclip, SendHorizonal, Plus, Bold, Italic, Underline, Strikethrough, List, ListOrdered, Eye, Trash2 } from 'lucide-react'

interface CommentEditorProps {
  onSubmit: (html: string, attachments: File[]) => void
}

export default function CommentEditor({ onSubmit }: CommentEditorProps) {
  const [attachments, setAttachments] = useState<File[]>([])
  const [editorEmpty, setEditorEmpty] = useState(true)
  const [isDragging, setIsDragging] = useState(false)
  const [previewIndex, setPreviewIndex] = useState(0)
  const [previewOpen, setPreviewOpen] = useState(false)
  const submitRef = useRef<() => void>(() => {})
  const editorRef = useRef<ReturnType<typeof useEditor>>(null)

  const editor = useEditor({
    extensions: [
      StarterKit,
      UnderlineExt,
      ImageExt,
      Placeholder.configure({ placeholder: 'Leave a comment...' }),
    ],
    content: '',
    onUpdate: useCallback(({ editor }: { editor: { isEmpty: boolean } }) => {
      setEditorEmpty(editor.isEmpty)
    }, []),
    editorProps: {
      handleKeyDown: (_view: unknown, event: KeyboardEvent) => {
        if (event.key === 'Enter') {
          const isMeta = event.metaKey || event.ctrlKey
          const inList = editorRef.current?.isActive('bulletList') || editorRef.current?.isActive('orderedList')
          // Cmd/Ctrl+Enter always sends
          if (isMeta) { submitRef.current(); return true }
          // Plain Enter outside a list sends
          if (!event.shiftKey && !inList) { submitRef.current(); return true }
        }
        return false
      },
    },
  })

  editorRef.current = editor

  if (!editor) return null

  const isEmpty = editorEmpty && attachments.length === 0

  const handleSubmit = () => {
    if (isEmpty) return
    onSubmit(editor.getHTML(), attachments)
    editor.commands.clearContent()
    setAttachments([])
  }

  submitRef.current = handleSubmit

  const handleFileAttach: UploadProps['beforeUpload'] = (file) => {
    setAttachments((prev) => [...prev, file])
    return false
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    Array.from(e.dataTransfer.files).forEach((file) => {
      setAttachments((prev) => [...prev, file])
    })
  }

  return (
    <div
      className={`comment-editor-wrapper${isDragging ? ' is-dragging' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
      onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragging(false) }}
      onDrop={handleDrop}
    >
      <BubbleMenu
        editor={editor}
        tippyOptions={{ duration: 100, placement: 'top' }}
      >
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

      <div className="comment-editor-body">
        <Tooltip title="Attach file" mouseEnterDelay={0.5}>
          <Upload beforeUpload={handleFileAttach} showUploadList={false} multiple>
            <Button type="text" size="small" icon={<Plus size={16} />} className="editor-attach-btn" />
          </Upload>
        </Tooltip>

        <div className="comment-editor-scroll-area">
          <EditorContent editor={editor} className="comment-editor-content" />
        </div>

        <Button
          type="text"
          size="small"
          icon={<SendHorizonal size={14} />}
          disabled={isEmpty}
          onClick={handleSubmit}
          className={`editor-send-btn${isEmpty ? '' : ' active'}`}
        />
      </div>

      {attachments.length > 0 && (
        <div className="attachment-list">
          {(() => {
            const images = attachments.filter((f) => f.type.startsWith('image/'))
            const files = attachments.filter((f) => !f.type.startsWith('image/'))
            return (
              <>
                {images.length > 0 && (
                  <div className="image-attachment-grid">
                    <Image.PreviewGroup
                      items={images.map((f) => URL.createObjectURL(f))}
                      preview={{
                        current: previewIndex,
                        open: previewOpen,
                        onChange: (i) => setPreviewIndex(i),
                        onVisibleChange: (v) => setPreviewOpen(v),
                      }}
                    >
                      {images.map((file, i) => {
                        const url = URL.createObjectURL(file)
                        return (
                          <div key={i} className="image-thumb-wrapper">
                            <img
                              src={url}
                              width={72}
                              height={72}
                              style={{ objectFit: 'cover', borderRadius: 6, display: 'block', width: 72, height: 72 }}
                            />
                            <div className="image-thumb-overlay">
                              <Eye
                                size={14}
                                className="thumb-action-icon"
                                onClick={() => { setPreviewIndex(i); setPreviewOpen(true) }}
                              />
                              <Trash2
                                size={14}
                                className="thumb-action-icon thumb-delete"
                                onClick={(e) => { e.stopPropagation(); setAttachments((prev) => prev.filter((f) => f !== file)) }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </Image.PreviewGroup>
                  </div>
                )}
                {files.length > 0 && (
                  <div className="file-attachment-list">
                    {files.map((file, i) => (
                      <div key={i} className="file-attachment-item">
                        <div className="file-attachment-inner">
                          <Paperclip size={16} className="file-attachment-icon" />
                          <span className="file-attachment-name">{file.name}</span>
                        </div>
                        <button
                          className="file-attachment-delete"
                          onClick={() => setAttachments((prev) => prev.filter((f) => f !== file))}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )
          })()}
        </div>
      )}
    </div>
  )
}
