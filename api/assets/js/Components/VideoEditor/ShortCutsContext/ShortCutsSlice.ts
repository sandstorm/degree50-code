import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export enum ShortCutModifierId {
    CTRL = 'ctrl',
    ALT = 'alt',
    OPTION = 'option',
    SHIFT = 'shift',
}

export const allShortCutModifiers = Object.values(ShortCutModifierId)

type ShortCutModifierConfiguration = {
    modifier: ShortCutModifierId
    enabled: boolean
}

export type ShortCutModifierConfigurations = Record<ShortCutModifierId, ShortCutModifierConfiguration>

export enum ShortCutId {
    TOGGLE_PLAY = 'togglePlay',
}

export const shortCutIds = Object.values(ShortCutId)

export type ShortCutConfiguration = {
    shortCutId: ShortCutId
    key: string
    modifiers: ShortCutModifierConfigurations
}

export type ShortCutsState = Record<ShortCutId, ShortCutConfiguration>

const initialState: ShortCutsState = {
    [ShortCutId.TOGGLE_PLAY]: {
        shortCutId: ShortCutId.TOGGLE_PLAY,
        key: 'p',
        modifiers: {
            [ShortCutModifierId.CTRL]: {
                modifier: ShortCutModifierId.CTRL,
                enabled: true,
            },
            [ShortCutModifierId.ALT]: {
                modifier: ShortCutModifierId.ALT,
                enabled: false,
            },
            [ShortCutModifierId.OPTION]: {
                modifier: ShortCutModifierId.OPTION,
                enabled: false,
            },
            [ShortCutModifierId.SHIFT]: {
                modifier: ShortCutModifierId.SHIFT,
                enabled: true,
            },
        },
    },
}

const ShortCutsSlice = createSlice({
    name: 'ShortCuts',
    initialState,
    reducers: {
        setShortCutsState: (state: ShortCutsState, action: PayloadAction<ShortCutsState>): ShortCutsState => {
            return action.payload
        },
        setKeyForShortCut: (
            state: ShortCutsState,
            action: PayloadAction<{ shortCutId: ShortCutId; key: ShortCutConfiguration['key'] }>
        ): ShortCutsState => {
            const { key, shortCutId } = action.payload
            return {
                ...state,
                [shortCutId]: {
                    ...state[shortCutId],
                    key,
                },
            }
        },
        toggleModifierForShortCut: (
            state: ShortCutsState,
            action: PayloadAction<{ shortCutId: ShortCutId; modifierId: ShortCutModifierId }>
        ): ShortCutsState => {
            const { shortCutId, modifierId } = action.payload

            const newState: ShortCutsState = {
                ...state,
                [shortCutId]: {
                    ...state[shortCutId],
                    modifiers: {
                        ...state[shortCutId].modifiers,
                        [modifierId]: {
                            ...state[shortCutId].modifiers[modifierId],
                            enabled: !state[shortCutId].modifiers[modifierId].enabled,
                        },
                    },
                },
            }

            // WHY: At least one modifier needs to be enabled
            if (allShortCutModifiers.filter((id) => newState[shortCutId].modifiers[id].enabled).length > 0) {
                return newState
            }
            return state
        },
    },
})

export default ShortCutsSlice.reducer
export const { setShortCutsState, toggleModifierForShortCut, setKeyForShortCut } = ShortCutsSlice.actions

export const selectShortCutsState = (state: { shortCuts: ShortCutsState }) => state.shortCuts
export const selectShortCutConfigurationById = (state: { shortCuts: ShortCutsState }, shortCutId: ShortCutId) =>
    state.shortCuts[shortCutId]
export const selectHotKeyByShortCutId = (state: { shortCuts: ShortCutsState }, shortCutId: ShortCutId) =>
    createHotKeyFromShortCut(state.shortCuts[shortCutId])

/**
 * Create shortCut string for `useHotKeys` from ShortCutConfiguration
 * e.g. 'ctrl+option+shift+p'
 */
function createHotKeyFromShortCut(shortCutConfiguration: ShortCutConfiguration): string {
    const modifierPrefix = Object.values(shortCutConfiguration.modifiers)
        .filter((modifierConfig) => modifierConfig.enabled)
        .map((modifierConfig) => modifierConfig.modifier)
        .join('+')

    return `${modifierPrefix}+${shortCutConfiguration.key}`
}
