import React from 'react'

type Props = {
    start: string
}

const Start = ({ start }: Props) => {
    return <div style={{ marginBottom: 5 }}>von: {start}</div>
}

export default React.memo(Start)
