import { useState } from 'react'
import { Button } from 'antd'
import { MessageSquare } from 'lucide-react'
import CommentsDrawer from './components/CommentsDrawer'
import './App.css'

function App() {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f5f5f5' }}>
      <Button
        type="primary"
        icon={<MessageSquare size={16} />}
        size="large"
        onClick={() => setDrawerOpen(true)}
        style={{ backgroundColor: '#7c6fcd', borderColor: '#7c6fcd' }}
      >
        Open Comments
      </Button>

      <CommentsDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Actions details"
      />
    </div>
  )
}

export default App
