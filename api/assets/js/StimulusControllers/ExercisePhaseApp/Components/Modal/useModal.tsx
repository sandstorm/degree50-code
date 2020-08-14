import React, { useState } from 'react'

import Modal from './Modal'

// Renders a modal to the modal root and handles the visibility state
// of this modal.
//
// NOTE: Each modal you want to render should use a separate hook!!!
// Otherwise your modals will share their visibility state which might lead
// to overlapping and unclosable elements.
export const useModal = () => {
    const [isVisible, setIsVisible] = useState(false)

    const showModal = () => setIsVisible(true)
    const hideModal = () => setIsVisible(false)

    const RenderModal = ({ children, title }: { children: React.ReactChild; title: string }) => (
        <React.Fragment>
            {isVisible && (
                <Modal closeModal={hideModal} isVisible={isVisible} title={title}>
                    {children}
                </Modal>
            )}
        </React.Fragment>
    )

    return {
        showModal,
        hideModal,
        RenderModal,
    }
}
