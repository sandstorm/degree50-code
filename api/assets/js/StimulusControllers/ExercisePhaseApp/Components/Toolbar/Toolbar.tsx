import React from 'react';
import {ToolbarItem} from "./ToolbarItem";
import {connect, useDispatch} from 'react-redux';
import {selectActiveToolbarItem, toggleComponent} from "./ToolbarSlice";
import {
    toggleVisibility
} from '../Modal/ModalSlice';

type Props = {
    components: string[],
    toggleComponent: any
    activeToolbarItem: string
}

export function ToolbarInner({components, toggleComponent, activeToolbarItem}: Props) {
    const toolbarItems = components.map((component: string, index: number) =>
        <ToolbarItem key={index} componentId={component} activeToolbarItem={activeToolbarItem} toggleComponent={toggleComponent}/>
    );

    const dispatchModal = useDispatch();
    const toggleComponentWrapper = (componentId: string) => {
        toggleComponent(componentId)
        // TODO robert fragen ob das geil ist...
        dispatchModal(toggleVisibility());
    };

    return (
        <div className={'toolbar'}>
            <ToolbarItem componentId={'task'} activeToolbarItem={activeToolbarItem} toggleComponent={toggleComponentWrapper}/>
            {/*{toolbarItems}*/}
        </div>
    );
}

const mapStateToProps = (state: any) => {
    return {
        activeToolbarItem: selectActiveToolbarItem(state),
    };
};

const mapDispatchToProps = (dispatch: any) => {
    return {
        toggleComponent: (componentId: string) => {
            dispatch(toggleComponent(componentId))
        },
    };
};

export const Toolbar = connect(
    mapStateToProps,
    mapDispatchToProps
)(ToolbarInner);