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
    timestamp: '2 hours ago',
    contentHtml: "<p>Hey team, just a heads up — the client pushed back on the timeline for the GI scope. They're requesting a 2-week extension before sign-off.</p>",
  },
  {
    id: '2',
    author: 'Alyshia Ho',
    initials: 'AH',
    isYou: true,
    timestamp: '1 hour ago',
    contentHtml: "<p>Got it. That's frustrating but not entirely surprising given how late the brief came in. Do we know if this affects the delivery milestone on our end?</p>",
  },
  {
    id: '3',
    author: 'Olivia Rhye',
    initials: 'OR',
    isYou: false,
    timestamp: '58 mins ago',
    contentHtml: "<p>It shouldn't affect milestone 2, but milestone 3 will likely shift. I'll update the project plan once Tim confirms. In the meantime, can you hold off on sending the final deliverables?</p>",
  },
  {
    id: '4',
    author: 'Alyshia Ho',
    initials: 'AH',
    isYou: true,
    timestamp: '45 mins ago',
    contentHtml: '<p>Sure, will hold. Also flagging that the supplementary design assets are ready on our side — happy to share them early if it helps the client prep.</p>',
    attachments: [
      { name: 'GI-Scope-Design-Assets-v3.fig', size: 8342016, url: '#' },
      { name: 'Brand-Guidelines-2024.pdf', size: 2097152, url: '#' },
    ],
  },
  {
    id: '5',
    author: 'Olivia Rhye',
    initials: 'OR',
    isYou: false,
    timestamp: '39 mins ago',
    contentHtml: "<p>Agreed. I've flagged this with Tim, he's checking whether the supplementary GI scope can be fast-tracked under the existing contract. Will update once we hear back.</p>",
  },
  {
    id: '6',
    author: 'Alyshia Ho',
    initials: 'AH',
    isYou: true,
    timestamp: '20 mins ago',
    contentHtml: "<p>Sounds good. Let me know what Tim says. I'll keep the team on standby until we have a clearer picture on the revised dates.</p>",
  },
  {
    id: '7',
    author: 'Olivia Rhye',
    initials: 'OR',
    isYou: false,
    timestamp: '10 mins ago',
    contentHtml: "<p>Will do. One more thing — can you double check the budget tracker? I think there's a discrepancy in the Q3 figures that we'll need to resolve before the client review.</p>",
    attachments: [
      { name: 'Q3-Budget-Tracker.xlsx', size: 524288, url: '#' },
    ],
  },
  {
    id: '8',
    author: 'Alyshia Ho',
    initials: 'AH',
    isYou: true,
    timestamp: '5 mins ago',
    contentHtml: "<p>On it. I'll have a look now and send through a corrected version by EOD.</p>",
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
  const prevLengthRef = useRef(MOCK_COMMENTS.length)

  useEffect(() => {
    if (comments.length > prevLengthRef.current) {
      listEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
    prevLengthRef.current = comments.length
  }, [comments])

  useEffect(() => {
    if (open) {
      setTimeout(() => listEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    }
  }, [open])

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
        type: f.type,
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
