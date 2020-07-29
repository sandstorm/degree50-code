import React from 'react'

type Props = {
    start: string
}

const Start = ({ start }: Props) => {
    return (
        <div className="input" style={{ marginBottom: 10 }}>
            {start}
        </div>
    )
}

export default React.memo(Start)
