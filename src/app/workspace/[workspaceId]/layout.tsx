'use client'

import { Sidebar } from './sidebar'
import { Toolbar } from './toolbar'
import {
  ResizablePanel,
  ResizablePanelGroup,
  ResizableHandle,
} from '@/components/ui/resizable'
import { WorkspaceSidebar } from './workspace-sidebar'
import { usePanel } from '@/hooks/use-panel'
import { Loader } from 'lucide-react'
import { Id } from '../../../../convex/_generated/dataModel'
import { Thread } from '@/features/messages/components/thread'
import { Profile } from '@/features/members/components/profile'

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { parentMessageId, profileMemberId, onClose } = usePanel()

  const showPanel = parentMessageId !== null || profileMemberId !== null

  return (
    <div className='h-full'>
      <Toolbar />
      <div className='flex h-[calc(100vh-40px)]'>
        <Sidebar />
        <ResizablePanelGroup
          direction='horizontal'
          autoSaveId='sc-workspace-layout'
        >
          <ResizablePanel
            id='sidebar'
            order={1}
            defaultSize={20}
            minSize={11}
            className='bg-[#5e2c5f]'
          >
            <WorkspaceSidebar />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel
            minSize={20}
            defaultSize={80}
            id='messageList'
            order={2}
          >
            {children}
          </ResizablePanel>
          {showPanel && (
            <>
              <ResizableHandle withHandle></ResizableHandle>
              <ResizablePanel
                minSize={20}
                defaultSize={29}
                id='threadOrProfile'
                order={3}
              >
                {parentMessageId ? (
                  <Thread
                    messageId={parentMessageId as Id<'messages'>}
                    onClose={onClose}
                  />
                ) : profileMemberId ? (
                  <Profile
                    memberId={profileMemberId as Id<'members'>}
                    onClose={onClose}
                  />
                ) : (
                  <div className='flex h-full items-center justify-center'>
                    <Loader className='size-5 animate-spin text-muted-foreground' />
                  </div>
                )}
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </div>
    </div>
  )
}
