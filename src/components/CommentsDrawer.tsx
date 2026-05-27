import { useState, useRef, useEffect } from 'react'
import { Drawer, Button, Typography } from 'antd'
import { Undo2 } from 'lucide-react'
import CommentItem from './CommentItem'
import type { Comment } from './CommentItem'
import CommentEditor from './CommentEditor'
import './CommentsDrawer.css'

const MOCK_COMMENTS: Comment[] = [
  {
    id: '1',
    author: 'Olivia Rhye',
    initials: 'OR',
    isYou: false,
    timestamp: '39 mins ago',
    contentHtml:
      "<p>Agreed. I've flagged this with Tim, he's checking whether the supplementary GI scope can be fast-tracked under the existing contract. Will update once we hear back.</p>",
  },
  {
    id: '2',
    author: 'Alyshia Ho',
    initials: 'AH',
    isYou: true,
    timestamp: '5 mins ago',
    contentHtml:
      '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor.</p>',
  },
  {
    id: '3',
    author: 'Alyshia Ho',
    initials: 'AH',
    isYou: true,
    timestamp: '5 mins ago',
    contentHtml:
      '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor.</p>',
  },
]

interface CommentsDrawerProps {
  open: boolean
  onClose: () => void
  title?: string
}

export default function CommentsDrawer({ open, onClose, title = 'Actions details' }: CommentsDrawerProps) {
  const [comments, setComments] = useState<Comment[]>(MOCK_COMMENTS)
  const listEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [comments])

  const handleEdit = (id: string, newHtml: string, attachments?: Comment['attachments']) => {
    setComments((prev) => prev.map((c) => c.id === id ? { ...c, contentHtml: newHtml, edited: true, attachments } : c))
  }

  const handleDelete = (id: string) => {
    setComments((prev) => prev.map((c) => c.id === id ? { ...c, deleted: true } : c))
  }

  const handleUndo = (id: string) => {
    setComments((prev) => prev.map((c) => c.id === id ? { ...c, deleted: false } : c))
  }

  const handleSubmit = (html: string, files: File[]) => {
    const newComment: Comment = {
      id: Date.now().toString(),
      author: 'Alyshia Ho',
      initials: 'AH',
      isYou: true,
      timestamp: 'just now',
      contentHtml: html,
      attachments: files.map((f) => ({
        name: f.name,
        size: f.size,
        url: URL.createObjectURL(f),
      })),
    }
    setComments((prev) => [...prev, newComment])
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      placement="right"
      width={584}
      closable={false}
      title={null}
      className="comments-drawer"
    >
      <div className="comments-drawer-inner">
        {/* Back button */}
        <div className="comments-back-btn">
          <Button
            type="text"
            icon={<Undo2 size={14} />}
            onClick={onClose}
            style={{ paddingLeft: 0, fontWeight: 500, color: '#1a1a1a' }}
          >
            Back
          </Button>
        </div>

        {/* Comment thread */}
        <div className="comments-list">
          {comments.map((c) => (
            <CommentItem key={c.id} comment={c} onEdit={handleEdit} onDelete={handleDelete} onUndo={handleUndo} />
          ))}
          <div ref={listEndRef} />
        </div>

        {/* Editor */}
        <div className="comments-editor-footer">
          <CommentEditor onSubmit={handleSubmit} />
        </div>
      </div>
    </Drawer>
  )
}
