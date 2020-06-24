import React from 'react';
import {connect} from 'react-redux';
import {selectComponent, selectIsVisible, toggleOverlayVisibility} from "./OverlaySlice";
import FileUpload from "../FileUpload/FileUpload";
import {ComponentTypesEnum} from "../../Store/ComponentTypesEnum";
import MaterialViewer from "../MaterialViewer/MaterialViewer";

const mapStateToProps = (state: any) => ({
    isVisible: selectIsVisible(state),
    component: selectComponent(state),
});

const mapDispatchToProps = (dispatch: any) => ({
    toggleOverlayVisibility: () => dispatch(toggleOverlayVisibility()),
});

type AdditionalProps = {
    // currently none
}

type OverlayProps = AdditionalProps & ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>

const Overlay: React.FC<OverlayProps> = ({...props}) => {

    let componentToRender = null
    switch(props.component) {
        case ComponentTypesEnum.DOCUMENT_UPLOAD:
            componentToRender = <FileUpload />
            break;
        case ComponentTypesEnum.MATERIAL_VIEWER:
            componentToRender = <MaterialViewer />
            break;
        default:

    }

    return (
        <div className={(props.isVisible === true) ? 'overlay overlay--is-visible' : 'overlay'}>
            <button className={'overlay__close btn'} type="button" onClick={props.toggleOverlayVisibility}><i className={'fas fa-times'}></i></button>
            <div className={'overlay__content'}>
                {componentToRender}
            </div>
        </div>
    );
}

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(Overlay);