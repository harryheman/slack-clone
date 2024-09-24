import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useNewJoinCode } from '@/features/workspaces/api/use-new-join-code'
import { useConfirm } from '@/hooks/use-confirm'
import { useWorkspaceId } from '@/hooks/use-workspace-id'
import { Copy, RefreshCcw } from 'lucide-react'
import { toast } from 'sonner'

type Props = {
  open: boolean
  setOpen: (open: boolean) => void
  name: string
  joinCode: string
}

export const InviteModal = ({ open, setOpen, name, joinCode }: Props) => {
  const workspaceId = useWorkspaceId()

  const [ConfirmDialog, confirm] = useConfirm(
    'Regenerating invite code',
    'This will deactivate the current invite code. Are you sure you want to continue?',
  )

  const { mutate, isPending } = useNewJoinCode()

  const handleCopy = async () => {
    const inviteLink = `${window.location.origin}/join/${workspaceId}`

    await navigator.clipboard.writeText(inviteLink)
    toast.success('Invite link copied to clipboard')
  }

  const handleNewCode = async () => {
    const ok = await confirm()
    if (!ok) return

    mutate(
      {
        workspaceId,
      },
      {
        onSuccess: () => {
          toast.success('Invite code regenerated')
        },
        onError: () => {
          toast.error('Failed to regenerate invite code')
        },
      },
    )
  }

  return (
    <>
      <ConfirmDialog />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className='bg-white'>
          <DialogHeader>
            <DialogTitle>Invite people to {name}</DialogTitle>
            <DialogDescription>
              Use the code below to invite people to your workspace
            </DialogDescription>
          </DialogHeader>
          <div className='flex flex-col gap-y-4 items-center justify-center py-10'>
            <p className='tracking-widest uppercase text-4xl font-bold'>
              {joinCode}
            </p>
            <Button variant={'ghost'} size={'sm'} onClick={handleCopy}>
              Copy link
              <Copy className='size-4 ml-2' />
            </Button>
          </div>
          <div className='flex items-center justify-between w-full'>
            <Button
              variant={'outline'}
              onClick={handleNewCode}
              disabled={isPending}
            >
              New code
              <RefreshCcw className='size-4 ml-2' />
            </Button>
            <DialogClose asChild>
              <Button>Close</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
