import React from 'react'

type Props = {
    isPredefined: boolean
}

const PredefinedCodeLock = ({ isPredefined }: Props) => {
    if (isPredefined) {
        const label = 'Dies ist ein Vorgegebener Video-Code und kann nicht bearbeitet werden.'
        return <i className={'video-code__locked fas fa-lock'} title={label} aria-label={label} />
    }

    // dummy icon for styling purposes
    return <i role="presentation" />
}

export default React.memo(PredefinedCodeLock)
