import React from 'react'
import { connect } from 'react-redux'
import { selectComponent, selectIsVisible, selectSize, setOverlayVisibility } from './OverlaySlice'
import FileUpload from '../FileUpload/FileUpload'
import { ComponentTypesEnum } from '../../Store/ComponentTypesEnum'
import MaterialViewer from '../MaterialViewer/MaterialViewer'
import { AppState, AppDispatch } from 'StimulusControllers/ExercisePhaseApp/Store/Store'

const mapStateToProps = (state: AppState) => ({
    isVisible: selectIsVisible(state),
    component: selectComponent(state),
    size: selectSize(state),
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
    switch (props.component) {
        case ComponentTypesEnum.DOCUMENT_UPLOAD:
            componentToRender = <FileUpload />
            break
        case ComponentTypesEnum.MATERIAL_VIEWER:
            componentToRender = <MaterialViewer />
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
                <i className={'fas fa-times'}></i>
            </button>
            <div className={'overlay__content'}>{componentToRender}</div>
        </div>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(Overlay)
