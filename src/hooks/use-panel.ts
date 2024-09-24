import { useProfileMemberId } from '@/features/members/store/use-parent-profile-member-id'
import { useParentMessageId } from '@/features/messages/store/use-parent-message-id'

export const usePanel = () => {
  const [parentMessageId, setParentMessageId] = useParentMessageId()
  const [profileMemberId, setProfileMemberId] = useProfileMemberId()

  const onOpenProfile = (id: string) => {
    setProfileMemberId(id)
    setParentMessageId(null)
  }

  const onOpenMessage = (id: string) => {
    setParentMessageId(id)
    setProfileMemberId(null)
  }

  const onClose = () => {
    setParentMessageId(null)
    setProfileMemberId(null)
  }

  return {
    parentMessageId,
    profileMemberId,
    onOpenMessage,
    onOpenProfile,
    onClose,
  }
}
