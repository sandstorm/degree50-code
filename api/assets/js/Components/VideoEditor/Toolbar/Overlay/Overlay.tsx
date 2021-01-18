import { FocusScope } from '@react-aria/focus'
import { OverlayContainer } from '@react-aria/overlays'
import { actions, selectors, VideoEditorState } from 'Components/VideoEditor/VideoEditorSlice'
import React, { FC, memo, useMemo } from 'react'
import { connect } from 'react-redux'
import { AppDispatch } from 'StimulusControllers/ExercisePhaseApp/Store/Store'
import { AnnotationOverlayIds } from '../AnnotationsContext/AnnotationsMenu'
import AllAnnotationsOverlay from '../AnnotationsContext/AllAnnotationsOverlay'

const mapOverlayIdToOverlayContent = (id?: string) => {
    switch (id) {
        case AnnotationOverlayIds.all:
            return <AllAnnotationsOverlay />
        default:
            return undefined
    }
}

const mapStateToProps = (state: VideoEditorState) => ({
    isVisible: selectors.overlay.isVisible(state),
    overlayId: selectors.overlay.overlayId(state),
})

const mapDispatchToProps = (dispatch: AppDispatch) => ({
    show: () => dispatch(actions.overlay.show()),
})

type Props = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>

const Overlay: FC<Props> = (props) => {
    const content = useMemo(() => mapOverlayIdToOverlayContent(props.overlayId), [props.overlayId])

    const isOpen = props.isVisible && content !== undefined

    return (
        <OverlayContainer
            style={{
                position: 'absolute',
                top: 0,
                height: '100vh',
                width: '100vw',
                display: isOpen ? 'grid' : 'none',
                placeItems: 'center',
            }}
        >
            {isOpen && (
                <div style={{ background: 'white', padding: '8px' }}>
                    <FocusScope autoFocus contain restoreFocus>
                        {content}
                    </FocusScope>
                </div>
            )}
        </OverlayContainer>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(memo(Overlay))
