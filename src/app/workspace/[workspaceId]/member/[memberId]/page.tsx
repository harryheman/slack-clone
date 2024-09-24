'use client'

import { useCreateOreGetConversation } from '@/features/conversations/api/use-create-or-get-conversation'
import { useMemberId } from '@/hooks/use-member-id'
import { useWorkspaceId } from '@/hooks/use-workspace-id'
import { AlertTriangle, Loader } from 'lucide-react'
import { useEffect } from 'react'
import { Conversation } from './conversation'

export default function MemberPage() {
  const workspaceId = useWorkspaceId()
  const memberId = useMemberId()

  const { data, mutate, isPending } = useCreateOreGetConversation()

  useEffect(() => {
    mutate({ workspaceId, memberId })
  }, [memberId, mutate, workspaceId])

  if (isPending) {
    return (
      <div className='h-full flex items-center justify-center'>
        <Loader className='size-6 animate-spin text-muted-foreground' />
      </div>
    )
  }

  if (!data) {
    return (
      <div className='h-full flex flex-col gap-2 items-center justify-center'>
        <AlertTriangle className='size-6 text-muted-foreground' />
        <span className='text-sm text-muted-foreground'>
          Conversation not found
        </span>
      </div>
    )
  }

  return <Conversation conversationId={data._id} />
}
