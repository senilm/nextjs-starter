/**
 * @file dialog-store.ts
 * @module stores/dialog-store
 * Global dialog state — open any registered dialog from anywhere in the app.
 * Supports optional data payloads for edit dialogs.
 */

import { create } from 'zustand'

export const DIALOG_KEY = {
  CREATE_PROJECT: 'createProject',
  EDIT_PROJECT: 'editProject',
  INVITE_USER: 'inviteUser',
  CREATE_ROLE: 'createRole',
  EDIT_ROLE: 'editRole',
  EDIT_PLAN: 'editPlan',
} as const

type DialogKey = (typeof DIALOG_KEY)[keyof typeof DIALOG_KEY]

interface DialogState {
  openDialogs: Record<string, boolean>
  dialogData: Record<string, unknown>
  openDialog: <T = unknown>(key: DialogKey, data?: T) => void
  closeDialog: (key: DialogKey) => void
  getDialogData: <T = unknown>(key: DialogKey) => T | null
}

export const useDialogStore = create<DialogState>((set, get) => ({
  openDialogs: {},
  dialogData: {},
  openDialog: (key, data) =>
    set((state) => ({
      openDialogs: { ...state.openDialogs, [key]: true },
      dialogData: data !== undefined ? { ...state.dialogData, [key]: data } : state.dialogData,
    })),
  closeDialog: (key) =>
    set((state) => {
      const { [key]: _, ...restData } = state.dialogData
      return {
        openDialogs: { ...state.openDialogs, [key]: false },
        dialogData: restData,
      }
    }),
  getDialogData: <T,>(key: DialogKey): T | null => {
    const data = get().dialogData[key]
    return (data as T) ?? null
  },
}))
