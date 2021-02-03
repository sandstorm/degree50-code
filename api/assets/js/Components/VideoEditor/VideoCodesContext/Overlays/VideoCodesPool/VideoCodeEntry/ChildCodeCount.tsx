import React from 'react'

type Props = {
    count: number
}

const ChildCodeCount = ({ count }: Props) => {
    return <div className="video-code__child-count">{count}</div>
}

export default React.memo(ChildCodeCount)
