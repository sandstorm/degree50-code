import React from 'react';
import {ToolbarItem} from "./ToolbarItem";
import {connect, useDispatch, useSelector} from 'react-redux';
import {selectActiveToolbarItem, toggleComponent, toggleToolbarVisibility, selectIsVisible} from "./ToolbarSlice";
import {
    setTitle,
    setContent,
    toggleVisibility
} from '../Modal/ModalSlice';
import {RootState} from "../../Store/Store";
import {ComponentTypesEnum} from "../../Store/ComponentTypesEnum";
import {ComponentId, Config, selectConfig} from "../Config/ConfigSlice";

const mapStateToProps = (state: RootState) => ({
    activeToolbarItem: selectActiveToolbarItem(state),
    isVisible: selectIsVisible(state),
    config: selectConfig(state)
});

const mapDispatchToProps = (dispatch: any, ) => ({
    toggleComponent: (componentId: ComponentId) => {
        dispatch(toggleComponent(componentId))
    },
    toggleToolbarVisibility: () => {
        dispatch(toggleToolbarVisibility())
    }
});

type AdditionalProps = {
}

export type Component = {
    id: ComponentId
    isMandatory: boolean
    label: string
    icon: string
    onClick: (dispatch: any,component: Component, config: Config) => void
}

type ToolbarProps = AdditionalProps & ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>

const possibleComponentsForToolbar: Array<Component> = [
    {
        id: ComponentTypesEnum.TASK,
        isMandatory: true,
        label: 'Aufgabenstellung',
        icon: 'fas fa-tasks',
        onClick: (dispatch, component, config) => {
            dispatch(toggleVisibility());
            dispatch(setTitle(config.title));
            dispatch(setContent(config.description));
        }
    },
    {
        id: ComponentTypesEnum.DOCUMENT_UPLOAD,
        isMandatory: false,
        label: 'Dokumenten-Upload',
        icon: 'fas fa-file-upload',
        onClick: (dispatch, component, config) => {
            console.log('test', component.id)
        }
    }
]

const Toolbar: React.FC<ToolbarProps> = ({...props}) => {
    const dispatch = useDispatch();
    const toggleComponentWrapper = (component: Component) => {
        props.toggleComponent(component.id)
        component.onClick(dispatch, component, props.config);
    };

    const toolbarItemsToRender = Object.values(possibleComponentsForToolbar).map(function(component: Component) {
        if (props.config.components.includes(component.id) || component.isMandatory) {
            return <ToolbarItem key={component.id} component={component} toggleComponent={toggleComponentWrapper}/>
        }
    });
    return (
        <div className={(props.isVisible === true) ? 'toolbar toolbar--is-visible' : 'toolbar'}>
            <button type="button" className={'toolbar__toggle'} onClick={props.toggleToolbarVisibility}><i className={(props.isVisible === true) ? 'fas fa-chevron-right' : 'fas fa-chevron-left'}></i></button>
            {toolbarItemsToRender}
        </div>
    );
}

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(Toolbar);