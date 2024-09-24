import { usePaginatedQuery } from 'convex/react'
import { FunctionReturnType } from 'convex/server'
import { api } from '../../../../convex/_generated/api'
import { Id } from '../../../../convex/_generated/dataModel'

const BATCH_SIZE = 20

type Props = {
  channelId?: Id<'channels'>
  conversationId?: Id<'conversations'>
  parentMessageId?: Id<'messages'>
}

export type GetMessagesReturnT = FunctionReturnType<
  typeof api.messages.get
>['page']
export const useGetMessages = ({
  channelId,
  conversationId,
  parentMessageId,
}: Props) => {
  const { results, status, loadMore } = usePaginatedQuery(
    api.messages.get,
    { channelId, conversationId, parentMessageId },
    { initialNumItems: BATCH_SIZE },
  )

  return { results, status, loadMore: () => loadMore(BATCH_SIZE) }
}
