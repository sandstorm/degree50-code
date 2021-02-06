import React from 'react'

type Props = {
    count: number
}

const ChildPrototypeCount = ({ count }: Props) => {
    return <div className="video-code__child-count">{count}</div>
}

export default React.memo(ChildPrototypeCount)
