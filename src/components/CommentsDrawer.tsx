import { useState, useRef, useEffect } from 'react'
import { Drawer, Button } from 'antd'
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
    attachments: [
      { name: 'qvb.jpeg', size: 204800, url: '/qvb.jpeg', type: 'image/jpeg' },
      { name: 'opera-house.jpeg', size: 184320, url: '/opera-house.jpeg', type: 'image/jpeg' },
    ],
  },
  {
    id: '4',
    author: 'Alyshia Ho',
    initials: 'AH',
    isYou: true,
    timestamp: '45 mins ago',
    contentHtml: '<p>Sure, will hold. Also flagging that the supplementary design assets are ready on our side — happy to share them early if it helps the client prep.</p>',
    attachments: [
      { name: 'crown-sydney.jpg', size: 312400, url: '/crown-sydney.jpg', type: 'image/jpeg' },
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
  {
    id: '9',
    author: 'Olivia Rhye',
    initials: 'OR',
    isYou: false,
    timestamp: 'just now',
    contentHtml: `<p>Following up on the geotechnical risk discussion from last week's design team meeting. I've now had a chance to review both the Phase 1 report and Marcus's updated scope document in detail, and I want to make sure we're all aligned before the variation instruction goes out.</p><p>Key concerns I'd like addressed before sign-off:</p><ul><li>The CPT spacing of 200m assumes relatively uniform geology between the flagged boreholes — but the Phase 1 borehole logs at BH-07 and BH-09 show a significant change in stratigraphy over less than 50m. I'd recommend reducing CPT spacing to 100m between chainage 1+400 and 1+750 specifically, even if we keep 200m elsewhere. The cost difference is marginal compared to the exposure if we miss something.</li><li>The lab testing scope doesn't currently include consolidation testing. Given the potential for settlement in the soft alluvial zone identified at BH-11, I think oedometer tests should be added for samples recovered from that zone. Worth confirming with the geotechnical lead whether this is captured elsewhere or genuinely missing.</li><li>The 6-week reporting timeline assumes continuous site access, but the contractor has flagged a 3-day shutdown window in week 4 for an unrelated utility diversion. This needs to be factored into the GI programme or we risk a late report landing after the (now extended) design freeze.</li></ul><p>Actions I'm tracking from this thread:</p><ul><li>Marcus to update CPT spacing in the scope doc to reflect 100m intervals in the flagged zone</li><li>Marcus to confirm with the geotech lead whether consolidation testing is required and update the lab suite accordingly</li><li>Priya to flag the week 4 shutdown to the GI contractor and get a revised programme before the scope doc is issued</li><li>Jordan to update the risk register once the revised scope is confirmed — current EMV estimate may need to be revisited if the additional testing changes the likelihood rating</li></ul><p>Happy to jump on a call if it's easier to work through the technical items live rather than in comments.</p>`,
    attachments: [
      { name: 'qvb.jpeg', size: 204800, url: '/qvb.jpeg', type: 'image/jpeg' },
      { name: 'crown-sydney.jpg', size: 312400, url: '/crown-sydney.jpg', type: 'image/jpeg' },
      { name: 'opera-house.jpeg', size: 184320, url: '/opera-house.jpeg', type: 'image/jpeg' },
      { name: 'Phase-1-Geotechnical-Report.pdf', size: 4718592, url: '#' },
      { name: 'GI-Scope-Document-v4.docx', size: 1048576, url: '#' },
      { name: 'CPT-Spacing-Analysis.xlsx', size: 720896, url: '#' },
      { name: 'BH-07-BH-09-Borehole-Logs.pdf', size: 3145728, url: '#' },
      { name: 'Risk-Register-EMV-Update.xlsx', size: 638976, url: '#' },
      { name: 'GI-Programme-Revised.mpp', size: 512000, url: '#' },
    ],
  },
]

interface CommentsDrawerProps {
  open: boolean
  onClose: () => void
  title?: string
}

export default function CommentsDrawer({ open, onClose }: CommentsDrawerProps) {
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
