import { EditorValue } from '@/components/editor'
import { useCreateMessage } from '@/features/messages/api/use-create-message'
import { useGenerateUploadUrl } from '@/features/upload/api/use-generate-upload-url'
import { useWorkspaceId } from '@/hooks/use-workspace-id'
import dynamic from 'next/dynamic'
import Quill from 'quill'
import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { Id } from '../../../../../../convex/_generated/dataModel'

const Editor = dynamic(() => import('@/components/editor'), {
  ssr: false,
})

type Props = {
  placeholder: string
  conversationId: Id<'conversations'>
}

type CreateMessageValues = {
  body: string
  conversationId: Id<'conversations'>
  workspaceId: Id<'workspaces'>
  image?: Id<'_storage'>
}

export const ChatInput = ({ placeholder, conversationId }: Props) => {
  const [editorKey, setEditorKey] = useState(0)
  const [isPending, setIsPending] = useState(false)

  const editorRef = useRef<Quill | null>(null)

  const workspaceId = useWorkspaceId()

  const { mutate: generateUploadUrl } = useGenerateUploadUrl()
  const { mutate: createMessage } = useCreateMessage()

  const handleSubmit = async ({ body, image }: EditorValue) => {
    setIsPending(true)
    editorRef.current?.enable(false)

    try {
      const values: CreateMessageValues = {
        body,
        conversationId,
        workspaceId,
        image: undefined,
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

  return (
    <div className='w-full px-5'>
      <Editor
        key={editorKey}
        placeholder={placeholder}
        onSubmit={handleSubmit}
        disabled={isPending}
        innerRef={editorRef}
      />
    </div>
  )
}
