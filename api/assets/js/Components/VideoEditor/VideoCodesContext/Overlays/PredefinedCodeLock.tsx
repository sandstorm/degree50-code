import React from 'react'

type Props = {
    isUserCreated: boolean
}

const PredefinedCodeLock = ({ isUserCreated }: Props) => {
    if (isUserCreated) {
        return <i className={'video-code__locked fas fa-lock'} title={'Vorgegebener Video-Code'} />
    }

    // dummy icon for styling purposes
    return <i />
}

export default React.memo(PredefinedCodeLock)
