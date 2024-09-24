import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useCreateWorkspaceModal } from '../store/use-create-workspace-modal'
import { useCreateWorkspace } from '../api/use-create-workspace'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export const CreateWorkspaceModal = () => {
  const router = useRouter()

  const [open, setOpen] = useCreateWorkspaceModal()
  const [name, setName] = useState('')

  const { mutate, isPending } = useCreateWorkspace()

  const handleClose = () => {
    setOpen(false)
    setName('')
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    mutate(
      { name },
      {
        onSuccess(id) {
          handleClose()
          toast.success('Workspace created')
          router.push(`/workspace/${id}`)
        },
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='bg-white'>
        <DialogHeader>
          <DialogTitle>Add a workspace</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <form className='space-y-4' onSubmit={handleSubmit}>
          <Input
            disabled={isPending}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
            placeholder='Workspace name'
            minLength={3}
            maxLength={80}
          />
          <div className='flex justify-end'>
            <Button disabled={isPending} type='submit'>
              Create
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
