import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { FaChevronDown } from 'react-icons/fa'

type Props = {
  memberName?: string
  memberImage?: string
  onClick?: () => void
}

export const Header = ({
  memberImage,
  memberName = 'Member',
  onClick,
}: Props) => {
  return (
    <div className='bg-white border-b h-[49px] flex items-center px-4 overflow-hidden'>
      <Button
        variant={'ghost'}
        className='text-lg font-semibold overflow-hidden w-auto px-2'
        size={'sm'}
        onClick={onClick}
      >
        <Avatar className='size-6 mr-2'>
          <AvatarImage src={memberImage} alt={memberName} />
          <AvatarFallback>{memberName[0].toUpperCase()}</AvatarFallback>
        </Avatar>
        <span className='truncate'>{memberName}</span>
        <FaChevronDown className='size-2.5 ml-2' />
      </Button>
    </div>
  )
}
