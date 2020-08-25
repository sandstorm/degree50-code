import React, { useRef } from 'react'
import { connect } from 'react-redux'
import { selectComponent, selectIsVisible, selectSize, setOverlayVisibility } from './OverlaySlice'
import FileUpload from '../FileUpload/FileUpload'
import { ComponentTypesEnum } from '../../../../types'
import MaterialViewer from '../MaterialViewer/MaterialViewer'
import { AppState, AppDispatch } from 'StimulusControllers/ExercisePhaseApp/Store/Store'
import VideoPlayerWrapper from '../../../../Components/VideoPlayer/VideoPlayerWrapper'
import Presence from '../Presence/Presence'
import ExerciseDescription from '../ExerciseDescription/ExerciseDescription'
import { selectConfig } from '../Config/ConfigSlice'

const mapStateToProps = (state: AppState) => ({
    isVisible: selectIsVisible(state),
    component: selectComponent(state),
    size: selectSize(state),
    videos: selectConfig(state).videos,
})

const mapDispatchToProps = (dispatch: AppDispatch) => ({
    setOverlayVisibility: (isVisible: boolean) => dispatch(setOverlayVisibility(isVisible)),
})

type AdditionalProps = {
    // currently none
}

export const overlaySizesEnum = {
    DEFAULT: 'default',
    SMALL: 'small',
    LARGE: 'large',
}

type OverlayProps = AdditionalProps & ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>

const Overlay: React.FC<OverlayProps> = (props) => {
    let componentToRender = null
    const videoNodeRef: React.RefObject<HTMLVideoElement> = useRef(null)
    const updateCurrentTime = (time: number) => {
        // nothing
    }
    switch (props.component) {
        case ComponentTypesEnum.TASK:
            componentToRender = <ExerciseDescription />
            break
        case ComponentTypesEnum.DOCUMENT_UPLOAD:
            componentToRender = <FileUpload />
            break
        case ComponentTypesEnum.MATERIAL_VIEWER:
            componentToRender = <MaterialViewer />
            break
        case ComponentTypesEnum.VIDEO_PLAYER:
            componentToRender = (
                <VideoPlayerWrapper
                    videos={props.videos}
                    updateCurrentTime={updateCurrentTime}
                    videoNodeRef={videoNodeRef}
                />
            )
            break
        case ComponentTypesEnum.PRESENCE:
            componentToRender = <Presence />
            break
        default:
    }

    const handleVisibilityToggle = () => {
        props.setOverlayVisibility(!props.isVisible)
    }

    const sizeClass = 'overlay--' + props.size
    const className = props.isVisible === true ? 'overlay overlay--is-visible' : 'overlay'
    return (
        <div className={className + ' ' + sizeClass}>
            <button className={'overlay__close btn'} type="button" onClick={handleVisibilityToggle}>
                <i className={'fas fa-times'} />
            </button>
            <div className={'overlay__content'}>{componentToRender}</div>
        </div>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(Overlay)
