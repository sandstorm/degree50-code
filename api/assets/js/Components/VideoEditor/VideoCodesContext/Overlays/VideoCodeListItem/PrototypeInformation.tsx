import { VideoCodePrototype } from 'Components/VideoEditor/types'
import React from 'react'
import PredefinedCodeLock from '../PredefinedCodeLock'
import Color from '../VideoCodesPool/VideoCodeEntry/Color'

type Props = {
    videoCodePrototype?: VideoCodePrototype
}

const PrototypeInformation = ({ videoCodePrototype }: Props) => {
    if (!videoCodePrototype) {
        return null
    }

    return (
        <div className="video-code-prototype-information">
            <Color color={videoCodePrototype.color} />
            <PredefinedCodeLock isUserCreated={videoCodePrototype.userCreated} />
            <label>{videoCodePrototype.name}</label>
        </div>
    )
}

export default React.memo(PrototypeInformation)
