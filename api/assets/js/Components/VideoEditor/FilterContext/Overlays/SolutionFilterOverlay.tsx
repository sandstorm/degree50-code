import { VideoEditorState, selectors, actions } from 'Components/VideoEditor/VideoEditorSlice'
import React, { memo, useCallback } from 'react'
import { connect } from 'react-redux'
import Overlay from '../../components/Overlay'
import { SolutionFilterOverlayIds } from '../FilterMenu'

const mapStateToProps = (state: VideoEditorState) => {
    const solutions = selectors.data.solutions.selectById(state)
    const previousSolutionsFromFilter = selectors.filter.selectPreviousSolutions(state)
    const previousSolutions = previousSolutionsFromFilter.map((s) => ({
        ...s,
        ...solutions[s.id],
    }))

    return {
        previousSolutions,
    }
}

const mapDispatchToProps = {
    closeOverlay: actions.overlay.unsetOverlay,
    togglePreviousSolution: actions.filter.togglePreviousSolution,
}

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps

const SolutionFilterOverlay = (props: Props) => {
    const close = () => {
        props.closeOverlay(SolutionFilterOverlayIds.filterSolutions)
    }

    const handleToggle = useCallback(
        (ev: React.ChangeEvent<HTMLInputElement>) => {
            props.togglePreviousSolution(ev.currentTarget.value)
        },
        [props.togglePreviousSolution]
    )

    return (
        <Overlay closeCallback={close} title="Aktive Lösungen">
            <ul className="solution-filter">
                {props.previousSolutions.map((s) => (
                    <li key={s.id}>
                        <label htmlFor={s.id}>
                            <input
                                id={s.id}
                                aria-label={`Lösung von ${s.userName ?? '<unbekannter Nutzer>'}`}
                                type="checkbox"
                                key={s.id}
                                checked={s.isVisible}
                                onChange={handleToggle}
                                value={s.id}
                            />
                            {s.userName}
                        </label>
                    </li>
                ))}
            </ul>
        </Overlay>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(memo(SolutionFilterOverlay))
