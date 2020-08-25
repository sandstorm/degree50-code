import React from 'react'

type Props = {
    end: string
}

const End = ({ end }: Props) => {
    return <div className="input">{end}</div>
}

export default React.memo(End)
