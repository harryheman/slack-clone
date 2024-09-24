import { atom, useAtom } from 'jotai'

const state = atom(false)

export const useCreateWorkspaceModal = () => {
  return useAtom(state)
}
