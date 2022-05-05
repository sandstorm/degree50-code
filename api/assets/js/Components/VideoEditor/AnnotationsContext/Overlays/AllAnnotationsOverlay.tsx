import { selectors, actions } from 'StimulusControllers/ExerciseAndSolutionStore/rootSlice'
import React, { FC, memo } from 'react'
import { connect } from 'react-redux'
import { AnnotationOverlayIds } from '../AnnotationsMenu'
import AnnotationListItem from 'Components/VideoEditor/AnnotationsContext/Overlays/AnnotationListItem'
import Overlay from '../../components/Overlay'
import { AppState } from 'StimulusControllers/ExerciseAndSolutionStore/Store'

const mapStateToProps = (state: AppState) => ({
    annotationIdsByStartTime: selectors.selectAllAnnotationIdsByStartTime(state),
})

const mapDispatchToProps = {
    closeOverlay: actions.videoEditor.overlay.unsetOverlay,
}

type OwnProps = {
    // TODO: make readonly property a redux state
    itemUpdateCondition: boolean
}

type Props = OwnProps & ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps

const AllAnnotationsOverlay: FC<Props> = (props) => {
    const close = () => {
        props.closeOverlay(AnnotationOverlayIds.all)
    }

    return (
        <Overlay closeCallback={close} title="Alle Annotationen">
            <ol className="video-editor__media-item-list-new">
                {props.annotationIdsByStartTime.map((id, index) => (
                    <AnnotationListItem key={id} annotationId={id} index={index} />
                ))}
            </ol>
        </Overlay>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(memo(AllAnnotationsOverlay))
