import React from 'react'

type Props = {
    videoUrl?: string
}

const VideoCutSolutionVideo: React.FC<Props> = (props) => {
    if (props.videoUrl === undefined) {
        return <p>No solution, yet!</p>
    }

    return <video controls height={'500px'} src={props.videoUrl} />
}

export default React.memo(VideoCutSolutionVideo)
