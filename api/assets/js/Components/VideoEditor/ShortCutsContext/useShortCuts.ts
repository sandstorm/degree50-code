import { useHotkeys } from 'react-hotkeys-hook'
import { useAppDispatch, useAppSelector } from '../../../StimulusControllers/ExerciseAndSolutionStore/Store'
import { initializeShortCuts } from './ShortCutsSaga'
import { useEffect } from 'react'
import { selectHotKeyByShortCutId, ShortCutId } from './ShortCutsSlice'
import { actions as PlayerActions } from '../PlayerSlice'
import { setCurrentTimeAsEndValueAction, setCurrentTimeAsStartValueAction } from './SetCurrentTimeAsValueShortCutSaga'
import { actions as OverlayActions } from '../components/OverlayContainer/OverlaySlice'
import { AnnotationOverlayIds } from '../AnnotationsContext/AnnotationsMenu'
import { VideoCodeOverlayIds } from '../VideoCodesContext/VideoCodesMenu'
import { CutOverlayIds } from '../CuttingContext/CuttingMenu'

export const useShortCuts = () => {
    const dispatch = useAppDispatch()

    useEffect(() => {
        dispatch(initializeShortCuts())
    }, [])

    /**
     * create hotKey for each shortCut
     * We could also handle all shortCuts in a single `useHotKeys` hook, but for now this way is easier
     */
    // togglePlay
    const togglePlayHotKey = useAppSelector((state) => selectHotKeyByShortCutId(state, ShortCutId.TOGGLE_PLAY))
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
    const setCurrentTimeAsStartValueHotKey = useAppSelector((state) =>
        selectHotKeyByShortCutId(state, ShortCutId.SET_CURRENT_TIME_AS_START_VALUE)
    )
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
    const setCurrentTimeAsEndValueHotKey = useAppSelector((state) =>
        selectHotKeyByShortCutId(state, ShortCutId.SET_CURRENT_TIME_AS_END_VALUE)
    )
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

    // createAnnotation
    const createAnnotationHotKey = useAppSelector((state) =>
        selectHotKeyByShortCutId(state, ShortCutId.CREATE_ANNOTATION)
    )
    useHotkeys(
        createAnnotationHotKey,
        (keyboardEvent) => {
            dispatch(OverlayActions.setOverlay({ overlayId: AnnotationOverlayIds.create, closeOthers: false }))

            keyboardEvent.preventDefault()
            keyboardEvent.stopPropagation()
        },
        { enableOnTags: ['SELECT', 'INPUT', 'TEXTAREA'] },
        [dispatch]
    )

    // createVideoCode
    const createVideoCodeHotKey = useAppSelector((state) =>
        selectHotKeyByShortCutId(state, ShortCutId.CREATE_VIDEO_CODE)
    )
    useHotkeys(
        createVideoCodeHotKey,
        (keyboardEvent) => {
            dispatch(OverlayActions.setOverlay({ overlayId: VideoCodeOverlayIds.create, closeOthers: false }))

            keyboardEvent.preventDefault()
            keyboardEvent.stopPropagation()
        },
        { enableOnTags: ['SELECT', 'INPUT', 'TEXTAREA'] },
        [dispatch]
    )

    // createVideoCode
    const createVideoCutHotKey = useAppSelector((state) => selectHotKeyByShortCutId(state, ShortCutId.CREATE_VIDEO_CUT))
    useHotkeys(
        createVideoCutHotKey,
        (keyboardEvent) => {
            dispatch(OverlayActions.setOverlay({ overlayId: CutOverlayIds.create, closeOthers: false }))

            keyboardEvent.preventDefault()
            keyboardEvent.stopPropagation()
        },
        { enableOnTags: ['SELECT', 'INPUT', 'TEXTAREA'] },
        [dispatch]
    )
}
