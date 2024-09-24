import { useCurrentMember } from '@/features/members/api/use-current-member'
import { useGetWorkspace } from '@/features/workspaces/api/use-get-workspace'
import { useWorkspaceId } from '@/hooks/use-workspace-id'
import {
  AlertTriangle,
  Hash,
  Loader,
  MessageSquareText,
  SendHorizonal,
} from 'lucide-react'
import { WorkSpaceHeader } from './workspace-header'
import { SidebarItem } from './sidebar-item'
import { useGetChannels } from '@/features/channels/api/use-get-channels'
import { WorkspaceSection } from './workspace-section'
import { useGetMembers } from '@/features/members/api/use-get-members'
import { UserItem } from './user-item'
import { useCreateChannelModal } from '@/features/channels/store/use-create-channel-modal'
import { useChannelId } from '@/hooks/use-channel-id'
import { useMemberId } from '@/hooks/use-member-id'

export const WorkspaceSidebar = () => {
  const workspaceId = useWorkspaceId()
  const { data: member, isLoading: memberLoading } =
    useCurrentMember(workspaceId)
  const { data: workspace, isLoading: workspaceLoading } =
    useGetWorkspace(workspaceId)
  const { data: channels, isLoading: channelsLoading } =
    useGetChannels(workspaceId)
  const { data: members, isLoading: membersLoading } =
    useGetMembers(workspaceId)

  const memberId = useMemberId()
  const channelId = useChannelId()

  const [_open, setOpen] = useCreateChannelModal()

  if (memberLoading || workspaceLoading || channelsLoading || membersLoading) {
    return (
      <div className='flex bg-[#5e2c5f] h-full items-center justify-center'>
        <Loader className='size-5 animate-spin text-white' />
      </div>
    )
  }

  if (!workspace || !member || !channels || !members) {
    return (
      <div className='flex flex-col gap-y-2 bg-[#5e2c5f] h-full items-center justify-center'>
        <AlertTriangle className='size-5 text-white' />
        <p className='text-white text-sm'>Workspace not found</p>
      </div>
    )
  }

  return (
    <div className='flex flex-col bg-[#5e2c5f] h-full'>
      <WorkSpaceHeader
        workspace={workspace}
        isAdmin={member.role === 'admin'}
      />
      <div className='flex flex-col px-2 mt-3'>
        <SidebarItem id='threads' label='Threads' icon={MessageSquareText} />
        <SidebarItem id='drafts' label='Drafts & Sent' icon={SendHorizonal} />
      </div>
      <WorkspaceSection
        label='Channels'
        hint='New channel'
        onNew={member.role === 'admin' ? () => setOpen(true) : undefined}
      >
        {channels.map((c) => (
          <SidebarItem
            key={c._id}
            id={c._id}
            label={c.name}
            icon={Hash}
            variant={channelId === c._id ? 'active' : 'default'}
          />
        ))}
      </WorkspaceSection>
      <WorkspaceSection
        label='Direct messages'
        hint='New direct message'
        onNew={() => {}}
      >
        {members?.map((m) => (
          <UserItem
            key={m._id}
            id={m._id}
            label={m.user.name}
            image={m.user.image}
            variant={m._id === memberId ? 'active' : 'default'}
          />
        ))}
      </WorkspaceSection>
    </div>
  )
}
