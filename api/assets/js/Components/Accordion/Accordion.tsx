import React, { memo, ReactNode, useState } from 'react'

type Props = {
    className?: string
    title: string
    children: ReactNode
}

const Accordion = (props: Props) => {
    const [isOpen, setIsOpen] = useState(false)

    const handleClick = () => setIsOpen((previousValue) => !previousValue)

    const className = `accordion${isOpen ? ' accordion--is-open' : ''} ${props.className ?? ''}`.trim()

    return (
        <div className={className}>
            <p className="accordion__title" onClick={handleClick}>
                <i className="fas fa-angle-right" />
                {props.title}
            </p>
            <div className="accordion__content">{props.children}</div>
        </div>
    )
}

export default memo(Accordion)
