import React, { memo, ReactNode, useMemo, useState } from 'react'
import Button from '../Button/Button'

type Props = {
    className?: string
    title: string | ReactNode
    buttonTitleClose: string
    buttonTitleOpen: string
    children: ReactNode
}

const Accordion = (props: Props) => {
    const [isOpen, setIsOpen] = useState(false)

    const handleClick = useMemo(() => () => setIsOpen((value) => !value), [])

    const className = `accordion${isOpen ? ' accordion--is-open' : ''} ${props.className ?? ''}`.trim()

    return (
        <div className={className}>
            <p tabIndex={1} className="accordion__title highlight-focus-within">
                {props.title}
                <Button
                    className="btn btn-outline-primary"
                    title={isOpen ? props.buttonTitleClose : props.buttonTitleOpen}
                    onPress={handleClick}
                >
                    <i className="fas fa-angle-right" />
                </Button>
            </p>
            <div className="accordion__content" aria-hidden={!isOpen}>
                {props.children}
            </div>
        </div>
    )
}

export default memo(Accordion)
