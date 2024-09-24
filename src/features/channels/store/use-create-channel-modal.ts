import { atom, useAtom } from 'jotai'

const state = atom(false)

export const useCreateChannelModal = () => {
  return useAtom(state)
}
