import React from 'react'
import { ToolbarItem } from './ToolbarItem'
import { connect } from 'react-redux'
import { selectActiveToolbarItem, toggleComponent, toggleToolbarVisibility, selectIsVisible } from './ToolbarSlice'
import { setOverlayVisibility, setOverlayComponent, setOverlaySize } from '../Overlay/OverlaySlice'
import { AppState, AppDispatch, useAppDispatch } from '../../../ExerciseAndSolutionStore/Store'
import { ComponentTypesEnum } from '../../../../types'
import { ComponentId, ConfigState, selectors } from '../Config/ConfigSlice'
import { overlaySizesEnum } from '../Overlay/Overlay'
import { PresenceToolbarItem } from './PresenceToolbarItem'

const mapStateToProps = (state: AppState) => ({
    activeToolbarItem: selectActiveToolbarItem(state),
    isVisible: selectIsVisible(state),
    config: selectors.selectConfig(state),
})

const mapDispatchToProps = (dispatch: AppDispatch) => ({
    toggleComponent: (componentId: ComponentId) => {
        dispatch(toggleComponent(componentId))
    },
    toggleToolbarVisibility: () => {
        dispatch(toggleToolbarVisibility())
    },
})

export type Component = {
    id: ComponentTypesEnum
    isMandatory: boolean
    label: string
    icon: string
    isVisible: (config: ConfigState) => boolean
    onClick: (dispatch: AppDispatch, component: Component, config: ConfigState, closeComponent: boolean) => void
}

type ToolbarProps = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>

const toggleOverlayVisibility = (dispatch: AppDispatch, closeComponent: boolean) => {
    if (closeComponent) {
        dispatch(setOverlayVisibility(false))
    } else {
        dispatch(setOverlayVisibility(true))
    }
}

const possibleComponentsForToolbar: Array<Component> = [
    {
        id: ComponentTypesEnum.PRESENCE,
        isMandatory: true,
        label: 'Gruppenmitglieder',
        icon: 'fas fa-users',
        isVisible: (config: ConfigState) => {
            return config.isGroupPhase
        },
        onClick: (dispatch, component, config, closeComponent) => {
            toggleOverlayVisibility(dispatch, closeComponent)
            dispatch(setOverlayComponent(component.id))
            dispatch(setOverlaySize(overlaySizesEnum.SMALL))
        },
    },
    {
        id: ComponentTypesEnum.TASK,
        isMandatory: true,
        label: 'Aufgabenstellung',
        icon: 'fas fa-tasks',
        isVisible: (config: ConfigState) => {
            return true
        },
        onClick: (dispatch, component, config, closeComponent) => {
            toggleOverlayVisibility(dispatch, closeComponent)
            dispatch(setOverlayComponent(component.id))
            dispatch(setOverlaySize(overlaySizesEnum.DEFAULT))
        },
    },
    {
        id: ComponentTypesEnum.ATTACHMENT_VIEWER,
        isMandatory: true,
        label: 'Anhänge',
        icon: 'fas fa-folder-open',
        isVisible: (config: ConfigState) => {
            return true
        },
        onClick: (dispatch, component, config, closeComponent) => {
            toggleOverlayVisibility(dispatch, closeComponent)
            dispatch(setOverlayComponent(component.id))
            dispatch(setOverlaySize(overlaySizesEnum.DEFAULT))
        },
    },
    {
        id: ComponentTypesEnum.VIDEO_PLAYER,
        isMandatory: false,
        label: 'Videos',
        icon: 'fas fa-file-video',
        isVisible: (config: ConfigState) => {
            return true
        },
        onClick: (dispatch, component, config, closeComponent) => {
            toggleOverlayVisibility(dispatch, closeComponent)
            dispatch(setOverlayComponent(component.id))
            dispatch(setOverlaySize(overlaySizesEnum.LARGE))
        },
    },
    {
        id: ComponentTypesEnum.DOCUMENT_UPLOAD,
        isMandatory: false,
        label: 'Dokumenten-Upload',
        icon: 'fas fa-file-upload',
        isVisible: (config: ConfigState) => {
            return true
        },
        onClick: (dispatch, component, config, closeComponent) => {
            toggleOverlayVisibility(dispatch, closeComponent)
            dispatch(setOverlayComponent(component.id))
            dispatch(setOverlaySize(overlaySizesEnum.DEFAULT))
        },
    },
]

const Toolbar: React.FC<ToolbarProps> = (props) => {
    const dispatch = useAppDispatch()
    const toggleComponentWrapper = (component: Component) => {
        props.toggleComponent(component.id)
        component.onClick(dispatch, component, props.config, props.activeToolbarItem === component.id)
        props.toggleToolbarVisibility()
    }

    const toolbarItemsToRender = possibleComponentsForToolbar
        .filter((component) => props.config.components.includes(component.id) || component.isMandatory)
        .filter((component) => component.isVisible(props.config))
        .map((component) =>
            component.id === ComponentTypesEnum.PRESENCE ? (
                <PresenceToolbarItem
                    key={component.id}
                    component={component}
                    toggleComponent={toggleComponentWrapper}
                />
            ) : (
                <ToolbarItem key={component.id} component={component} toggleComponent={toggleComponentWrapper} />
            )
        )

    return (
        <div className={props.isVisible === true ? 'toolbar toolbar--is-visible' : 'toolbar'}>
            <button
                aria-label="Toolbar öffnen/schließen"
                type="button"
                className={'toolbar__toggle'}
                onClick={props.toggleToolbarVisibility}
            >
                <i className={props.isVisible === true ? 'fas fa-chevron-right' : 'fas fa-chevron-left'} />
            </button>
            {toolbarItemsToRender}
        </div>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(Toolbar)
