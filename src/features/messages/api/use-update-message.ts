import { useMutation } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
import { useCallback, useState } from 'react'
import { Id } from '../../../../convex/_generated/dataModel'

type RequestT = {
  id: Id<'messages'>
  body: string
}
type ResponseT = Id<'messages'> | null

type Options = {
  onSuccess?: (data: ResponseT) => void
  onError?: (e: Error) => void
  onSettled?: () => void
  throwError?: boolean
}

export const useUpdateMessage = () => {
  const [data, setData] = useState<ResponseT>(null)
  const [error, setError] = useState<Error | null>(null)
  const [status, setStatus] = useState<
    'success' | 'error' | 'settled' | 'pending' | null
  >(null)

  const isSuccess = status === 'success'
  const isError = status === 'error'
  const isSettled = status === 'settled'
  const isPending = status === 'pending'

  const mutation = useMutation(api.messages.update)

  const mutate = useCallback(
    async (values: RequestT, options?: Options) => {
      setData(null)
      setError(null)
      setStatus('pending')
      try {
        const response = await mutation(values)
        setData(response)
        setStatus('success')
        options?.onSuccess?.(response)
        return response
      } catch (e) {
        setError(e as Error)
        setStatus('error')
        options?.onError?.(e as Error)
        if (options?.throwError) {
          throw e
        }
      } finally {
        setStatus('settled')
        options?.onSettled?.()
      }
    },
    [mutation],
  )

  return { mutate, data, error, isPending, isSuccess, isError, isSettled }
}
