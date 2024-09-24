import React from 'react'
import { Id } from '../../../../convex/_generated/dataModel'
import { useGetMember } from '../api/use-get-member'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { AlertTriangle, ChevronDown, Loader, Mail, XIcon } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu'
import Link from 'next/link'
import { useUpdateMember } from '../api/use-update-member'
import { useRemoveMember } from '../api/use-remove-member'
import { useCurrentMember } from '../api/use-current-member'
import { useWorkspaceId } from '@/hooks/use-workspace-id'
import { toast } from 'sonner'
import { useConfirm } from '@/hooks/use-confirm'
import { useRouter } from 'next/navigation'

type Props = {
  memberId: Id<'members'>
  onClose: () => void
}

export const Profile = ({ memberId, onClose }: Props) => {
  const router = useRouter()

  const workspaceId = useWorkspaceId()

  const [LeaveDialog, confirmLeave] = useConfirm(
    'Leave workspace',
    'Are you sure you want to leave this workspace?',
  )
  const [RemoveDialog, confirmRemove] = useConfirm(
    'Remove member',
    'Are you sure you want to remove this member?',
  )

  const { data: currentMember, isLoading: currentMemberLoading } =
    useCurrentMember(workspaceId)
  const { data: member, isLoading: memberLoading } = useGetMember(memberId)

  const { mutate: updateMember, isPending: updatingMember } = useUpdateMember()
  const { mutate: removeMember, isPending: removingMember } = useRemoveMember()

  const avatarFallback = member?.user.name?.[0].toUpperCase() || 'M'

  const isLoading = currentMemberLoading || memberLoading

  const onRemove = async () => {
    const ok = await confirmRemove()
    if (!ok) return

    removeMember(
      { id: memberId },
      {
        onSuccess: () => {
          toast.success('Member removed')
          onClose()
        },
        onError: () => {
          toast.error('Failed to remove member')
        },
      },
    )
  }

  const onLeave = async () => {
    const ok = await confirmLeave()
    if (!ok) return

    removeMember(
      { id: memberId },
      {
        onSuccess: () => {
          toast.success('You left the workspace')
          onClose()
          router.replace('/')
        },
        onError: () => {
          toast.error('Failed to leave workspace')
        },
      },
    )
  }

  const onUpdate = (role: 'member' | 'admin') => {
    updateMember(
      { id: memberId, role },
      {
        onSuccess: () => {
          toast.success('Role updated')
          onClose()
        },
        onError: () => {
          toast.error('Failed to update role')
        },
      },
    )
  }

  return (
    <>
      <LeaveDialog />
      <RemoveDialog />
      <div className='h-full flex flex-col'>
        <div className='flex justify-between items-center px-4 h-[49px] border-b'>
          <p className='text-lg font-bold'>Profile</p>
          <Button onClick={onClose} size={'iconSm'} variant={'ghost'}>
            <XIcon className='size-5 stroke-[1.5]' />
          </Button>
        </div>
        {isLoading && (
          <div className='flex h-full items-center justify-center'>
            <Loader className='size-5 animate-spin text-muted-foreground' />
          </div>
        )}
        {!isLoading && !member && (
          <div className='flex flex-col gap-2 h-full items-center justify-center'>
            <AlertTriangle className='size-5 text-muted-foreground' />
            <p className='text-sm text-muted-foreground'>Profile not found</p>
          </div>
        )}
        {!isLoading && member && (
          <>
            <div className='flex flex-col items-center justify-center p-4'>
              <Avatar className='max-w-[128px] max-h-[128px] size-full'>
                <AvatarImage src={member.user.image} alt={member.user.name} />
                <AvatarFallback className='aspect-square text-4xl'>
                  {avatarFallback}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className='flex flex-col p-4'>
              <p className='text-xl font-bold'>{member.user.name}</p>
              {currentMember?.role === 'admin' &&
                (currentMember?._id !== memberId ? (
                  <div className='flex items-center gap-2 mt-4'>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild disabled={updatingMember}>
                        <Button
                          variant={'outline'}
                          className='w-full capitalize'
                          disabled={updatingMember}
                        >
                          {member.role}
                          <ChevronDown className='size-4 ml-2' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className='w-full'>
                        <DropdownMenuRadioGroup
                          value={member.role}
                          onValueChange={(role) =>
                            onUpdate(role as 'member' | 'admin')
                          }
                        >
                          <DropdownMenuRadioItem value='admin'>
                            Admin
                          </DropdownMenuRadioItem>
                          <DropdownMenuRadioItem value='member'>
                            Member
                          </DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button
                      variant={'outline'}
                      className='w-full'
                      onClick={onRemove}
                      disabled={removingMember}
                    >
                      Remove
                    </Button>
                  </div>
                ) : currentMember?._id === memberId &&
                  currentMember?.role !== 'admin' ? (
                  <div className='mt-4'>
                    <Button
                      variant={'outline'}
                      className='w-full'
                      onClick={onLeave}
                      disabled={removingMember}
                    >
                      Leave
                    </Button>
                  </div>
                ) : null)}
            </div>
            <Separator />
            <div className='flex flex-col p-4'>
              <p className='text-sm font-bold mb-4'>Contact information</p>
              <div className='flex items-center gap-2'>
                <div className='size-9 rounded-md bg-muted flex items-center justify-center'>
                  <Mail className='size-4' />
                </div>
                <div className='flex flex-col'>
                  <p className='text-[13px] font-semibold text-muted-foreground'>
                    Email address
                  </p>
                  <Link
                    href={`mailto:${member.user.email}`}
                    className='text-sm hover:underline text-[#1264a3]'
                  >
                    {member.user.email}
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}
