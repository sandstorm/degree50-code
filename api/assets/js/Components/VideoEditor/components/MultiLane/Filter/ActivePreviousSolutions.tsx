import React, { useCallback } from 'react'
import { connect } from 'react-redux'
import { VideoEditorState, actions, selectors } from 'Components/VideoEditor/VideoEditorSlice'

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
    togglePreviousSolution: actions.filter.togglePreviousSolution,
}

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps

const ActivePreviousSolutions = (props: Props) => {
    const handleToggle = useCallback(
        (ev: React.ChangeEvent<HTMLInputElement>) => {
            props.togglePreviousSolution(ev.currentTarget.value)
        },
        [props.togglePreviousSolution]
    )

    return (
        <div className="multilane-filter__components">
            <h2>Lösungen:</h2>
            <ul>
                {props.previousSolutions.map((s) => (
                    <li key={s.id}>
                        <label htmlFor={s.id}>
                            <input
                                id={s.id}
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
        </div>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(React.memo(ActivePreviousSolutions))
