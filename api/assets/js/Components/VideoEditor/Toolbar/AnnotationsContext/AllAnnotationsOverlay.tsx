import { actions } from 'Components/VideoEditor/VideoEditorSlice'
import React, { FC, memo } from 'react'
import { connect } from 'react-redux'
import { AppDispatch } from 'StimulusControllers/ExercisePhaseApp/Store/Store'

const mapDispatchToProps = (dispatch: AppDispatch) => ({
    closeOverlay: () => dispatch(actions.overlay.hide()),
})

type Props = ReturnType<typeof mapDispatchToProps>

const AllAnnotationsOverlay: FC<Props> = (props) => {
    const handleKeyDown = (ev: React.KeyboardEvent<HTMLElement>) => {
        if (ev.key === 'Escape') {
            ev.preventDefault()
            props.closeOverlay()
            return false
        }
    }

    return (
        <div onKeyDown={handleKeyDown}>
            All Annotations <button>lala</button>
        </div>
    )
}

export default connect(undefined, mapDispatchToProps)(memo(AllAnnotationsOverlay))
