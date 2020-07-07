import React from 'react'
import { ToolbarItem } from './ToolbarItem'
import { connect } from 'react-redux'
import { selectActiveToolbarItem, toggleComponent, toggleToolbarVisibility, selectIsVisible } from './ToolbarSlice'
import { setTitle, setComponent, toggleModalVisibility } from '../Modal/ModalSlice'
import { setOverlayVisibility, setOverlayComponent, setOverlaySize } from '../Overlay/OverlaySlice'
import { AppState, AppDispatch, useAppDispatch } from '../../Store/Store'
import { ComponentTypesEnum } from '../../Store/ComponentTypesEnum'
import { ComponentId, Config, selectConfig } from '../Config/ConfigSlice'
import { overlaySizesEnum } from '../Overlay/Overlay'

const mapStateToProps = (state: AppState) => ({
    activeToolbarItem: selectActiveToolbarItem(state),
    isVisible: selectIsVisible(state),
    config: selectConfig(state),
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
    onClick: (dispatch: AppDispatch, component: Component, config: Config) => void
}

type ToolbarProps = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>

const possibleComponentsForToolbar: Array<Component> = [
    {
        id: ComponentTypesEnum.TASK,
        isMandatory: true,
        label: 'Aufgabenstellung',
        icon: 'fas fa-tasks',
        onClick: (dispatch, component, config) => {
            dispatch(toggleModalVisibility())
            dispatch(setTitle(config.title))
            dispatch(setComponent(ComponentTypesEnum.EXERCISE_DESCRIPTION))
        },
    },
    {
        id: ComponentTypesEnum.MATERIAL_VIEWER,
        isMandatory: true,
        label: 'Material',
        icon: 'fas fa-folder-open',
        onClick: (dispatch, component, config) => {
            dispatch(setOverlayVisibility(true))
            dispatch(setOverlayComponent(component.id))
            dispatch(setOverlaySize(overlaySizesEnum.DEFAULT))
        },
    },
    {
        id: ComponentTypesEnum.VIDEO_PLAYER,
        isMandatory: false,
        label: 'Videos',
        icon: 'fas fa-file-video',
        onClick: (dispatch, component, config) => {
            dispatch(setOverlayVisibility(true))
            dispatch(setOverlayComponent(component.id))
            dispatch(setOverlaySize(overlaySizesEnum.LARGE))
        },
    },
    {
        id: ComponentTypesEnum.DOCUMENT_UPLOAD,
        isMandatory: false,
        label: 'Dokumenten-Upload',
        icon: 'fas fa-file-upload',
        onClick: (dispatch, component, config) => {
            dispatch(setOverlayVisibility(true))
            dispatch(setOverlayComponent(component.id))
            dispatch(setOverlaySize(overlaySizesEnum.DEFAULT))
        },
    },
]

const Toolbar: React.FC<ToolbarProps> = (props) => {
    const dispatch = useAppDispatch()
    const toggleComponentWrapper = (component: Component) => {
        props.toggleComponent(component.id)
        component.onClick(dispatch, component, props.config)
        props.toggleToolbarVisibility()
    }

    const toolbarItemsToRender = possibleComponentsForToolbar
        .filter((component) => props.config.components.includes(component.id) || component.isMandatory)
        .map((component) => (
            <ToolbarItem key={component.id} component={component} toggleComponent={toggleComponentWrapper} />
        ))

    return (
        <div className={props.isVisible === true ? 'toolbar toolbar--is-visible' : 'toolbar'}>
            <button
                aria-label="Toolbar öffnen/schließen"
                type="button"
                className={'toolbar__toggle'}
                onClick={props.toggleToolbarVisibility}
            >
                <i className={props.isVisible === true ? 'fas fa-chevron-right' : 'fas fa-chevron-left'}></i>
            </button>
            {toolbarItemsToRender}
        </div>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(Toolbar)
