import AnnotationListItem from 'Components/VideoEditor/AnnotationsContext/Overlays/AnnotationListItem'
import Overlay from 'Components/VideoEditor/components/Overlay'
import CutListItem from 'Components/VideoEditor/CuttingContext/Overlays/CutListItem'
import { MediaItemTypeEnum } from 'Components/VideoEditor/types'
import VideoCodeListItem from 'Components/VideoEditor/VideoCodesContext/Overlays/VideoCodeListItem'
import React from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { actions, selectors } from 'StimulusControllers/ExerciseAndSolutionStore/rootSlice'
import { AppState } from 'StimulusControllers/ExerciseAndSolutionStore/Store'
import { AllMediaItemsOverlayIds } from '../AllMediaItemsMenu'

const mapStateToProps = (state: AppState) => {
    return {
        allMediaItems: selectors.selectAllMediaItemsByStartTime(state),
    }
}

const mapDispatchToProps = {
    unsetOverlay: actions.videoEditor.overlay.unsetOverlay,
}

const connector = connect(mapStateToProps, mapDispatchToProps)

type PropsFromRedux = ConnectedProps<typeof connector>

type Props = PropsFromRedux

const AllMediaItemsOverlay = (props: Props) => {
    const { unsetOverlay, allMediaItems } = props

    const handleClose = () => {
        unsetOverlay(AllMediaItemsOverlayIds.all)
    }

    return (
        <Overlay closeCallback={handleClose} title="Alle Annotationen, Codierungen und Schnitte">
            <ol className="video-editor__media-item-list-new">
                {allMediaItems.map((mediaItem, index) => {
                    switch (mediaItem.type) {
                        case MediaItemTypeEnum.annotation: {
                            return <AnnotationListItem key={mediaItem.id} annotationId={mediaItem.id} index={index} />
                        }

                        case MediaItemTypeEnum.videoCode: {
                            return <VideoCodeListItem key={mediaItem.id} videoCodeId={mediaItem.id} index={index} />
                        }

                        case MediaItemTypeEnum.cut: {
                            return <CutListItem key={mediaItem.id} cutId={mediaItem.id} index={index} />
                        }

                        default: {
                            return null
                        }
                    }
                })}
            </ol>
        </Overlay>
    )
}

export default connector(React.memo(AllMediaItemsOverlay))
