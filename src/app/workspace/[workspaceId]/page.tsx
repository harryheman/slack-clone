'use client'

import { useGetChannels } from '@/features/channels/api/use-get-channels'
import { useCreateChannelModal } from '@/features/channels/store/use-create-channel-modal'
import { useCurrentMember } from '@/features/members/api/use-current-member'
import { useGetWorkspace } from '@/features/workspaces/api/use-get-workspace'
import { useWorkspaceId } from '@/hooks/use-workspace-id'
import { Loader, TriangleAlert } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo } from 'react'

export default function WorkspacePage() {
  const workspaceId = useWorkspaceId()
  const router = useRouter()
  const [open, setOpen] = useCreateChannelModal()

  const { data: workspace, isLoading: workspaceLoading } =
    useGetWorkspace(workspaceId)
  const { data: channels, isLoading: channelsLoading } =
    useGetChannels(workspaceId)
  const { data: member, isLoading: memberLoading } =
    useCurrentMember(workspaceId)

  const channelId = useMemo(() => channels?.[0]?._id, [channels])
  const isAdmin = useMemo(() => member?.role === 'admin', [member?.role])

  useEffect(() => {
    if (
      workspaceLoading ||
      channelsLoading ||
      memberLoading ||
      !member ||
      !workspace
    )
      return

    if (channelId) {
      router.push(`/workspace/${workspaceId}/channel/${channelId}`)
    } else if (!open && isAdmin) {
      setOpen(true)
    }
  }, [
    channelId,
    channelsLoading,
    isAdmin,
    member,
    memberLoading,
    open,
    router,
    setOpen,
    workspace,
    workspaceId,
    workspaceLoading,
  ])

  if (workspaceLoading || channelsLoading || memberLoading) {
    return (
      <div className='h-full flex-1 flex items-center justify-center'>
        <Loader className='size-5 animate-spin text-muted-foreground' />
      </div>
    )
  }

  if (!workspace || !member) {
    return (
      <div className='h-full flex-1 flex flex-col gap-2 items-center justify-center'>
        <TriangleAlert className='size-5 text-muted-foreground' />
        <span className='text-sm text-muted-foreground'>
          Workspace not found
        </span>
      </div>
    )
  }

  return (
    <div className='h-full flex-1 flex flex-col gap-2 items-center justify-center'>
      <TriangleAlert className='size-5 text-muted-foreground' />
      <span className='text-sm text-muted-foreground'>No channel found</span>
    </div>
  )
}
