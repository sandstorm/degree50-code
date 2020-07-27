import React, { useEffect, useState, ReactChildren } from 'react'

type Props = {
    width: number
    onClose: () => void
    children: ReactChildren
    title: string
}

const Dialog = ({ width, onClose, children, title }: Props) => {
    const [activeName, setActiveName] = useState('')

    useEffect(() => {
        setTimeout(() => setActiveName('subtitle-editor-dialog__inner--active'), 100)
    }, [])

    return (
        <div className="subtitle-editor-dialog" onClick={() => onClose()}>
            <div
                style={{ width: width || 500 }}
                className={`subtitle-editor-dialog__inner ${activeName}`}
                onClick={(event) => event.stopPropagation()}
            >
                <div className="subtitle-editor-dialog__title">
                    {title || 'Title'}{' '}
                    <i className="subtitle-editor-dialog__cancel icon-cancel" onClick={() => onClose()}></i>
                </div>
                <div className="subtitle-editor-dialog__content">{children}</div>
            </div>
        </div>
    )
}

export default Dialog
