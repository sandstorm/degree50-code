import { useHotkeys } from 'react-hotkeys-hook'
import { useAppDispatch, useAppSelector } from './StimulusControllers/ExerciseAndSolutionStore/Store'
import { selectShortCutMapping } from './ShortCutsSlice'
import { triggerShortCut } from './ShortCutsSaga'

export const useShortCuts = () => {
    const dispatch = useAppDispatch()

    const shortCuts = useAppSelector(selectShortCutMapping)

    const shortCutListAsString = Object.keys(shortCuts).join(', ')

    useHotkeys(
        shortCutListAsString,
        (ev, hotKeysEvent) => {
            const mappedShortCut = shortCuts[hotKeysEvent.shortcut]

            if (mappedShortCut) {
                dispatch(triggerShortCut(mappedShortCut))
            }

            ev.preventDefault()
            ev.stopPropagation()
        },
        { enableOnTags: ['SELECT', 'INPUT', 'TEXTAREA'] },
        [dispatch]
    )
}
