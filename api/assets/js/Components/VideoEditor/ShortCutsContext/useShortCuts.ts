import { useHotkeys } from 'react-hotkeys-hook'
import { useAppDispatch, useAppSelector } from '../../../StimulusControllers/ExerciseAndSolutionStore/Store'
import { initializeShortCuts } from './ShortCutsSaga'
import { useEffect } from 'react'
import { selectHotKeyByShortCutId, ShortCutId } from './ShortCutsSlice'
import { actions as PlayerActions } from '../PlayerSlice'
import { setCurrentTimeAsEndValueAction, setCurrentTimeAsStartValueAction } from './SetCurrentTimeAsValueShortCutSaga'

export const useShortCuts = () => {
    const dispatch = useAppDispatch()

    useEffect(() => {
        dispatch(initializeShortCuts())
    }, [])

    const togglePlayHotKey = useAppSelector((state) => selectHotKeyByShortCutId(state, ShortCutId.TOGGLE_PLAY))
    const setCurrentTimeAsStartValueHotKey = useAppSelector((state) =>
        selectHotKeyByShortCutId(state, ShortCutId.SET_CURRENT_TIME_AS_START_VALUE)
    )
    const setCurrentTimeAsEndValueHotKey = useAppSelector((state) =>
        selectHotKeyByShortCutId(state, ShortCutId.SET_CURRENT_TIME_AS_END_VALUE)
    )

    /**
     * create hotKey for each shortCut
     * We could also handle all shortCuts in a single `useHotKeys` hook, but for now this way is easier
     */
    // togglePlay
    useHotkeys(
        togglePlayHotKey,
        (keyboardEvent) => {
            dispatch(PlayerActions.togglePlay())

            keyboardEvent.preventDefault()
            keyboardEvent.stopPropagation()
        },
        { enableOnTags: ['SELECT', 'INPUT', 'TEXTAREA'] },
        [dispatch]
    )

    // setCurrentTimeAsStartValue
    useHotkeys(
        setCurrentTimeAsStartValueHotKey,
        (keyboardEvent) => {
            dispatch(setCurrentTimeAsStartValueAction())

            keyboardEvent.preventDefault()
            keyboardEvent.stopPropagation()
        },
        { enableOnTags: ['SELECT', 'INPUT', 'TEXTAREA'] },
        [dispatch]
    )

    // setCurrentTimeAsEndValue
    useHotkeys(
        setCurrentTimeAsEndValueHotKey,
        (keyboardEvent) => {
            dispatch(setCurrentTimeAsEndValueAction())

            keyboardEvent.preventDefault()
            keyboardEvent.stopPropagation()
        },
        { enableOnTags: ['SELECT', 'INPUT', 'TEXTAREA'] },
        [dispatch]
    )
}
