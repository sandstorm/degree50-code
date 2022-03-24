import { useHotkeys } from 'react-hotkeys-hook'
import { useAppDispatch, useAppSelector } from '../../../StimulusControllers/ExerciseAndSolutionStore/Store'
import { initializeShortCuts } from './ShortCutsSaga'
import { useEffect } from 'react'
import { selectHotKeyByShortCutId, ShortCutId } from './ShortCutsSlice'
import { actions as PlayerActions } from '../PlayerSlice'

export const useShortCuts = () => {
    const dispatch = useAppDispatch()

    useEffect(() => {
        dispatch(initializeShortCuts())
    }, [])

    const togglePlayHotKey = useAppSelector((state) => selectHotKeyByShortCutId(state, ShortCutId.TOGGLE_PLAY))

    // create hotKey for each shortCut
    useHotkeys(
        togglePlayHotKey,
        (ev) => {
            dispatch(PlayerActions.togglePlay())

            ev.preventDefault()
            ev.stopPropagation()
        },
        { enableOnTags: ['SELECT', 'INPUT', 'TEXTAREA'] },
        [dispatch]
    )
}
