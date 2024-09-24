import { format } from 'date-fns'

type Props = {
  title: string
  creationTime: number
}

export const ChannelHero = ({ title, creationTime }: Props) => {
  return (
    <div className='mt-[88px] mx-5 mb-4'>
      <p className='text-2xl font-bold flex items-center mb-2'># {title}</p>
      <p className='font-normal text-slate-800 mb-4'>
        This channel was created on {format(creationTime, 'MMMM do, yyyy')}.
        This is the very beggining of the <strong>{title}</strong> channel.
      </p>
    </div>
  )
}
