import React from 'react'
import ReactDOM from 'react-dom'
import { useOverlay, usePreventScroll, useModal, OverlayContainer } from '@react-aria/overlays'
import { FocusScope } from '@react-aria/focus'
import Button from 'Components/Button/Button'

type Props = {
    children: React.ReactChild
    title: string
    isVisible: boolean
    closeModal: () => void
}

const Modal = React.memo(({ children, title, isVisible, closeModal }: Props) => {
    const domEl = document.getElementById('modal-root')

    // Handle interacting outside the dialog and pressing
    // the Escape key to close the modal.
    // @ts-ignore
    const modalRef: React.RefObject<HTMLDivElement> = React.useRef()
    const { overlayProps } = useOverlay(
        { isOpen: isVisible, isDismissable: true, onClose: closeModal },
        // @ts-ignore
        modalRef
    )

    // Prevent scrolling while the modal is open, and hide content
    // outside the modal from screen readers.
    usePreventScroll()
    useModal()

    if (!domEl) return null

    return ReactDOM.createPortal(
        <OverlayContainer>
            <div role="dialog" tabIndex={-1} className={'modal'} aria-modal={true} aria-label={title}>
                <FocusScope contain restoreFocus autoFocus>
                    <div className={'modal__inner'} ref={modalRef} {...overlayProps}>
                        <header className={'modal__header'}>
                            <h3>{title}</h3>
                        </header>
                        <div className={'modal__content-wrapper'}>
                            <div className={'modal__content'}>{children}</div>
                        </div>
                        <footer className={'modal__footer'}>
                            <Button onPress={closeModal} className={'btn btn-primary'}>
                                Close
                            </Button>
                        </footer>
                    </div>
                </FocusScope>
            </div>
        </OverlayContainer>,
        domEl
    )
})

export default Modal
