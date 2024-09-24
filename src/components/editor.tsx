import Quill, { QuillOptions } from 'quill'
import 'quill/dist/quill.snow.css'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Button } from './ui/button'
import { PiTextAa } from 'react-icons/pi'
import { MdSend } from 'react-icons/md'
import { ImageIcon, Smile, XIcon } from 'lucide-react'
import { Hint } from './hint'
import { Delta, Op } from 'quill/core'
import { cn } from '@/lib/utils'
import { EmojiPopover } from './emoji-popover'
import Image from 'next/image'

export type EditorValue = {
  image: File | null
  body: string
}

type Props = {
  variant?: 'create' | 'update'
  onSubmit: (value: EditorValue) => void
  onCancel?: () => void
  placeholder?: string
  defaultValue?: Delta | Op[]
  disabled?: boolean
  innerRef?: React.MutableRefObject<Quill | null>
}

export default function Editor({
  variant = 'create',
  onSubmit,
  onCancel,
  placeholder = 'Write something...',
  defaultValue = [],
  disabled = false,
  innerRef,
}: Props) {
  const [text, setText] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [isToolbarVisible, setIsToolbarVisible] = useState(true)

  const submitRef = useRef(onSubmit)
  const placeholderRef = useRef(placeholder)
  const quillRef = useRef<Quill | null>(null)
  const defaultValueRef = useRef(defaultValue)
  const containerRef = useRef<HTMLDivElement>(null)
  const disabledRef = useRef(disabled)
  const imageElRef = useRef<HTMLInputElement>(null)

  useLayoutEffect(() => {
    submitRef.current = onSubmit
    placeholderRef.current = placeholder
    defaultValueRef.current = defaultValue
    disabledRef.current = disabled
  }, [onSubmit, placeholder, defaultValue, disabled])

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const editorContainer = container.appendChild(
      container.ownerDocument.createElement('div'),
    )

    const options: QuillOptions = {
      theme: 'snow',
      placeholder: placeholderRef.current,
      modules: {
        toolbar: [
          ['bold', 'italic', 'strike'],
          ['link'],
          [{ list: 'ordered' }, { list: 'bullet' }],
        ],
        keyboard: {
          bindings: {
            enter: {
              key: 'Enter',
              handler: () => {
                const text = quill.getText()
                const addedImage = imageElRef.current?.files?.[0] || null

                const isEmpty =
                  !addedImage &&
                  text.replace(/<(.|\n)*?>/g, '').trim().length === 0
                if (isEmpty) return

                const body = JSON.stringify(quill.getContents())

                submitRef.current?.({
                  image: addedImage,
                  body,
                })
              },
            },
            shift_enter: {
              key: 'Enter',
              shiftKey: true,
              handler: () => {
                quill.insertText(quill.getSelection()?.index || 0, '\n')
              },
            },
          },
        },
      },
    }

    const quill = new Quill(editorContainer, options)
    quillRef.current = quill
    quillRef.current.focus()

    if (innerRef) {
      innerRef.current = quill
    }

    quill.setContents(defaultValueRef.current)
    setText(quill.getText())

    quill.on(Quill.events.TEXT_CHANGE, () => {
      setText(quill.getText())
    })

    return () => {
      quill.off(Quill.events.TEXT_CHANGE)
      if (container) {
        container.innerHTML = ''
      }
      if (quillRef.current) {
        quillRef.current = null
      }
      if (innerRef) {
        innerRef.current = null
      }
    }
  }, [innerRef])

  const toggleToolbar = () => {
    setIsToolbarVisible(!isToolbarVisible)
    const toolbarEl = containerRef.current?.querySelector('.ql-toolbar')
    if (toolbarEl) {
      toolbarEl.classList.toggle('hidden')
    }
  }

  const onEmojiSelect = (emoji: string) => {
    const quill = quillRef.current
    if (!quill) return
    const cursorPosition = quill.getSelection()?.index || 0
    quill.insertText(cursorPosition, emoji)
  }

  const isEmpty = !image && text.replace(/<(.|\n)*?>/g, '').trim().length === 0

  return (
    <div className='flex flex-col'>
      <input
        type='file'
        accept='image/*'
        ref={imageElRef}
        onChange={(e) => setImage(e.target.files![0])}
        className='hidden'
      />
      <div
        className={cn(
          'flex flex-col border border-slate-200 rounded-md overflow-hidden focus-within:border-slate-300 focus-within:shadow-sm transition bg-white',
          disabled && 'opacity-50 cursor-not-allowed',
        )}
      >
        <div ref={containerRef} className='h-full ql-custom' />
        {!!image && (
          <div className='p-2'>
            <div className='relative size-[62px] flex items-center justify-center group/image'>
              <Hint label='Remove image'>
                <button
                  onClick={() => {
                    setImage(null)
                    imageElRef.current!.value = ''
                  }}
                  className='hidden group-hover/image:flex rounded-full bg-black/70 hover:bg-black absolute -top-2.5 -right-2.5 text-white size-6 z-[4] border-2 border-white items-center justify-center'
                >
                  <XIcon className='size-3.5' />
                </button>
              </Hint>
              <Image
                src={URL.createObjectURL(image)}
                alt='Image'
                fill
                className='rounded-xl overflow-hidden border object-cover'
              />
            </div>
          </div>
        )}
        <div className='flex px-2 pb-2 z-[5]'>
          <Hint label={isToolbarVisible ? 'Hide toolbar' : 'Show toolbar'}>
            <Button
              disabled={disabled}
              size={'iconSm'}
              variant={'ghost'}
              onClick={toggleToolbar}
            >
              <PiTextAa className='size-4' />
            </Button>
          </Hint>
          <EmojiPopover onEmojiSelect={onEmojiSelect}>
            <Button disabled={disabled} size={'iconSm'} variant={'ghost'}>
              <Smile className='size-4' />
            </Button>
          </EmojiPopover>
          {variant === 'create' && (
            <>
              <Hint label='Image'>
                <Button
                  disabled={disabled}
                  size={'iconSm'}
                  variant={'ghost'}
                  onClick={() => {
                    imageElRef.current?.click()
                  }}
                >
                  <ImageIcon className='size-4' />
                </Button>
              </Hint>
              <Button
                size={'iconSm'}
                className={cn(
                  'ml-auto bg-[#007a5a] hover:bg-[#007a5a]/80 text-white',
                  isEmpty && 'bg-white hover:bg-white text-muted-foreground',
                )}
                disabled={disabled || isEmpty}
                onClick={() => {
                  onSubmit({
                    body: JSON.stringify(quillRef.current?.getContents()),
                    image,
                  })
                }}
              >
                <MdSend className='size-4' />
              </Button>
            </>
          )}
          {variant === 'update' && (
            <div className='ml-auto flex items-center gap-2'>
              <Button
                variant={'outline'}
                size={'sm'}
                onClick={onCancel}
                disabled={disabled}
              >
                Cancel
              </Button>
              <Button
                size={'sm'}
                onClick={() => {
                  onSubmit({
                    body: JSON.stringify(quillRef.current?.getContents()),
                    image,
                  })
                }}
                disabled={disabled || isEmpty}
                className='bg-[#007a5a] hover:bg-[#007a5a]/80 text-white'
              >
                Save
              </Button>
            </div>
          )}
        </div>
      </div>
      {variant === 'create' && (
        <div
          className={cn(
            'p-2 text-[10px] text-muted-foreground flex justify-end opacity-0 transition',
            !isEmpty && 'opacity-100',
          )}
        >
          <p>
            <strong>Shift + Return</strong> to add a new line
          </p>
        </div>
      )}
    </div>
  )
}
