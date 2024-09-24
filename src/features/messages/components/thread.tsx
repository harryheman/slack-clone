import { Button } from '@/components/ui/button'
import { Id } from '../../../../convex/_generated/dataModel'
import { AlertTriangle, Loader, XIcon } from 'lucide-react'
import { useGetMessage } from '../api/use-get-message'
import { Message } from '@/components/message'
import { useCurrentMember } from '@/features/members/api/use-current-member'
import { useWorkspaceId } from '@/hooks/use-workspace-id'
import { useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import Quill from 'quill'
import { useGenerateUploadUrl } from '@/features/upload/api/use-generate-upload-url'
import { useCreateMessage } from '../api/use-create-message'
import { useChannelId } from '@/hooks/use-channel-id'
import { toast } from 'sonner'
import { EditorValue } from '@/components/editor'
import { useGetMessages } from '../api/use-get-messages'
import { differenceInMinutes, format, isToday, isYesterday } from 'date-fns'

const Editor = dynamic(() => import('@/components/editor'), {
  ssr: false,
})

type Props = {
  messageId: Id<'messages'>
  onClose: () => void
}

type CreateMessageValues = {
  channelId: Id<'channels'>
  workspaceId: Id<'workspaces'>
  parentMessageId: Id<'messages'>
  body: string
  image?: Id<'_storage'>
}

const TIME_THRESHOLD = 5

const formatDateLabel = (dateStr: string) => {
  const date = new Date(dateStr)
  if (isToday(date)) {
    return 'Today'
  }
  if (isYesterday(date)) {
    return 'Yesterday'
  }
  return format(date, 'EEEE, MMMM d')
}

export const Thread = ({ messageId, onClose }: Props) => {
  const [editingId, setEditingId] = useState<Id<'messages'> | null>(null)
  const [editorKey, setEditorKey] = useState(0)
  const [isPending, setIsPending] = useState(false)

  const editorRef = useRef<Quill | null>(null)

  const { mutate: generateUploadUrl } = useGenerateUploadUrl()
  const { mutate: createMessage } = useCreateMessage()

  const channelId = useChannelId()
  const workspaceId = useWorkspaceId()

  const { data: currentMember } = useCurrentMember(workspaceId)
  const { data: message, isLoading: loadingMessage } = useGetMessage(messageId)
  const { results, status, loadMore } = useGetMessages({
    channelId,
    parentMessageId: messageId,
  })

  const canLoadMore = status === 'CanLoadMore'
  const isLoadingMore = status === 'LoadingMore'

  const handleSubmit = async ({ body, image }: EditorValue) => {
    setIsPending(true)
    editorRef.current?.enable(false)

    try {
      const values: CreateMessageValues = {
        channelId,
        workspaceId,
        body,
        image: undefined,
        parentMessageId: messageId,
      }

      if (image) {
        const url = await generateUploadUrl(undefined, { throwError: true })
        if (!url) {
          throw new Error('Failed to generate upload URL')
        }

        const result = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': image.type,
          },
          body: image,
        })
        if (!result.ok) {
          throw new Error('Failed to upload image')
        }
        const { storageId } = await result.json()
        if (storageId) {
          values.image = storageId
        }
      }

      await createMessage(values, {
        throwError: true,
      })

      setEditorKey((k) => k + 1)
    } catch (e) {
      console.error(e)
      toast.error('Failed to send message')
    } finally {
      setIsPending(false)
      editorRef.current?.enable(true)
    }
  }

  const groupedMessages = results?.reduce(
    (acc, message) => {
      const date = new Date(message._creationTime)
      const dateKey = format(date, 'yyyy-MM-dd')
      if (!acc[dateKey]) {
        acc[dateKey] = []
      }
      acc[dateKey].unshift(message)
      return acc
    },
    {} as Record<string, typeof results>,
  )

  const isLoading = loadingMessage || status === 'LoadingFirstPage'

  return (
    <div className='h-full flex flex-col'>
      <div className='flex justify-between items-center px-4 h-[49px] border-b'>
        <p className='text-lg font-bold'>Thread</p>
        <Button onClick={onClose} size={'iconSm'} variant={'ghost'}>
          <XIcon className='size-5 stroke-[1.5]' />
        </Button>
      </div>
      {isLoading && (
        <div className='flex h-full items-center justify-center'>
          <Loader className='size-5 animate-spin text-muted-foreground' />
        </div>
      )}
      {!isLoading && !message && (
        <div className='flex flex-col gap-2 h-full items-center justify-center'>
          <AlertTriangle className='size-5 text-muted-foreground' />
          <p className='text-sm text-muted-foreground'>Message not found</p>
        </div>
      )}
      {!isLoading && message && (
        <>
          <div className='flex-1 flex flex-col-reverse pb-4 overflow-y-auto messages-scrollbar'>
            {Object.entries(groupedMessages || {}).map(
              ([dateKey, messages]) => (
                <div key={dateKey}>
                  <div className='text-center my-2 relative'>
                    <hr className='absolute top-1/2 left-0 right-0 border-t border-gray-300' />
                    <span className='relative inline-block bg-white px-4 py-1 rounded-full text-xs border border-gray-300 shadow-sm'>
                      {formatDateLabel(dateKey)}
                    </span>
                  </div>
                  {messages.map((message, index) => {
                    const prevMessage = messages[index - 1]
                    const isCompact =
                      prevMessage &&
                      prevMessage.user._id === message.user._id &&
                      differenceInMinutes(
                        new Date(message._creationTime),
                        new Date(prevMessage._creationTime),
                      ) < TIME_THRESHOLD

                    return (
                      <Message
                        key={message._id}
                        id={message._id}
                        memberId={message.memberId}
                        authorImage={message.user.image}
                        authorName={message.user.name}
                        isAuthor={message.memberId === currentMember?._id}
                        reactions={message.reactions}
                        body={message.body}
                        image={message.image}
                        updatedAt={message.updatedAt}
                        createdAt={message._creationTime}
                        isEditing={editingId === message._id}
                        setEditingId={setEditingId}
                        isCompact={isCompact}
                        hideThreadButton
                        threadCount={message.threadCount}
                        threadName={message.threadName}
                        threadImage={message.threadImage}
                        threadTimestamp={message.threadTimestamp}
                      />
                    )
                  })}
                </div>
              ),
            )}
            <div
              className='h-1'
              ref={(el) => {
                if (el) {
                  const observer = new IntersectionObserver(
                    (entries) => {
                      if (entries[0].isIntersecting && canLoadMore) {
                        loadMore()
                      }
                    },
                    {
                      threshold: 1,
                    },
                  )
                  observer.observe(el)
                  return () => observer.disconnect()
                }
              }}
            />
            {isLoadingMore && (
              <div className='text-center my-2 relative'>
                <hr className='absolute top-1/2 left-0 right-0 border-t border-gray-300' />
                <span className='relative inline-block bg-white px-4 py-1 rounded-full text-xs border border-gray-300 shadow-sm'>
                  <Loader className='animate-spin size-4' />
                </span>
              </div>
            )}
            <Message
              id={message._id}
              hideThreadButton
              memberId={message.memberId}
              authorImage={message.user.image}
              authorName={message.user.name}
              isAuthor={message.memberId === currentMember?._id}
              body={message.body}
              createdAt={message._creationTime}
              updatedAt={message.updatedAt}
              reactions={message.reactions}
              isEditing={editingId === message._id}
              setEditingId={setEditingId}
            />
          </div>
          <div>
            <Editor
              key={editorKey}
              innerRef={editorRef}
              placeholder='Reply'
              onSubmit={handleSubmit}
              disabled={isPending}
            />
          </div>
        </>
      )}
    </div>
  )
}
