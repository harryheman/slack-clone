import { useMutation } from 'convex/react'
import { useCallback, useState } from 'react'
import { api } from '../../../../convex/_generated/api'

type ResponseT = string | null

type Options = {
  onSuccess?: (data: ResponseT) => void
  onError?: (e: Error) => void
  onSettled?: () => void
  throwError?: boolean
}

export const useGenerateUploadUrl = () => {
  const [data, setData] = useState<ResponseT>(null)
  const [error, setError] = useState<Error | null>(null)
  const [status, setStatus] = useState<
    'success' | 'error' | 'settled' | 'pending' | null
  >(null)

  const isSuccess = status === 'success'
  const isError = status === 'error'
  const isSettled = status === 'settled'
  const isPending = status === 'pending'

  const mutation = useMutation(api.upload.generateUploadUrl)

  const mutate = useCallback(
    async (_values: undefined, options?: Options) => {
      setData(null)
      setError(null)
      setStatus('pending')
      try {
        const response = await mutation()
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
