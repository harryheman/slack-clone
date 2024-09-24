import { MessageList } from '@/components/message-list'
import { useGetMember } from '@/features/members/api/use-get-member'
import { useGetMessages } from '@/features/messages/api/use-get-messages'
import { useMemberId } from '@/hooks/use-member-id'
import { usePanel } from '@/hooks/use-panel'
import { Loader } from 'lucide-react'
import { Id } from '../../../../../../convex/_generated/dataModel'
import { ChatInput } from './chat-input'
import { Header } from './header'

type Props = {
  conversationId: Id<'conversations'>
}

export const Conversation = ({ conversationId }: Props) => {
  const memberId = useMemberId()

  const { onOpenProfile } = usePanel()

  const { data: member, isLoading: memberLoading } = useGetMember(memberId)

  const { results, status, loadMore } = useGetMessages({
    conversationId,
  })

  if (memberLoading || status === 'LoadingFirstPage') {
    return (
      <div className='h-full flex items-center justify-center'>
        <Loader className='size-6 animate-spin text-muted-foreground' />
      </div>
    )
  }

  return (
    <div className='flex flex-col h-full'>
      <Header
        memberName={member?.user.name}
        memberImage={member?.user.image}
        onClick={() => onOpenProfile(memberId)}
      />
      <MessageList
        variant='conversation'
        memberName={member?.user.name}
        memberImage={member?.user.image}
        data={results}
        loadMore={loadMore}
        isLoadingMore={status === 'LoadingMore'}
        canLoadMore={status === 'CanLoadMore'}
      />
      <ChatInput
        conversationId={conversationId}
        placeholder={`Message ${member?.user.name}`}
      />
    </div>
  )
}
