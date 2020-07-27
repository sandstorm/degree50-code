import React from 'react'
import { connect } from 'react-redux'
import { selectIsVisible, selectTitle, selectContent, selectComponent, toggleModalVisibility } from './ModalSlice'
import ExerciseDescription from '../ExerciseDescription/ExerciseDescription'
import { ComponentTypesEnum } from '../../Store/ComponentTypesEnum'
import { AppState, AppDispatch } from 'StimulusControllers/ExercisePhaseApp/Store/Store'
import { useOverlay, usePreventScroll, useModal, OverlayContainer } from '@react-aria/overlays'
import { FocusScope } from '@react-aria/focus'
import Button from '../Button/Button'

const mapStateToProps = (state: AppState) => ({
    isVisible: selectIsVisible(state),
    title: selectTitle(state),
    content: selectContent(state),
    component: selectComponent(state),
})

const mapDispatchToProps = (dispatch: AppDispatch) => ({
    toggleModalVisibility: () => dispatch(toggleModalVisibility()),
})

type AdditionalProps = {
    // currently none
}

type ModalProps = AdditionalProps & ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>

const Modal: React.FC<ModalProps> = (props) => {
    let componentToRender = null
    switch (props.component) {
        case ComponentTypesEnum.EXERCISE_DESCRIPTION:
            componentToRender = <ExerciseDescription />
            break
        default:
    }

    // Handle interacting outside the dialog and pressing
    // the Escape key to close the modal.
    // @ts-ignore
    const modalRef: React.RefObject<HTMLDivElement> = React.useRef()
    const { overlayProps } = useOverlay(
        { isOpen: props.isVisible, isDismissable: true, onClose: props.toggleModalVisibility },
        // @ts-ignore
        modalRef
    )

    // Prevent scrolling while the modal is open, and hide content
    // outside the modal from screen readers.
    usePreventScroll()
    useModal()

    return (
        <>
            {props.isVisible && (
                <OverlayContainer>
                    <div role="dialog" tabIndex={-1} className={'modal'} aria-modal={true} aria-label={props.title}>
                        <FocusScope contain restoreFocus autoFocus>
                            <div className={'modal__inner'} ref={modalRef} {...overlayProps}>
                                <header className={'modal__header'}>
                                    <h3>{props.title}</h3>
                                </header>
                                <div className={'modal__content-wrapper'}>
                                    <div className={'modal__content'}>
                                        {props.content}
                                        {componentToRender ? componentToRender : ''}
                                    </div>
                                </div>
                                <footer className={'modal__footer'}>
                                    <Button onPress={() => props.toggleModalVisibility()} className={'btn btn-primary'}>
                                        Close
                                    </Button>
                                </footer>
                            </div>
                        </FocusScope>
                    </div>
                </OverlayContainer>
            )}
        </>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(Modal)
