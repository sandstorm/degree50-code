import React from 'react'

type Props = {
    isPredefined: boolean
}

const PredefinedCodeLock = ({ isPredefined }: Props) => {
    if (isPredefined) {
        return <i className={'video-code__locked fas fa-lock'} title={'Vorgegebener Video-Code'} />
    }

    // dummy icon for styling purposes
    return <i />
}

export default React.memo(PredefinedCodeLock)
