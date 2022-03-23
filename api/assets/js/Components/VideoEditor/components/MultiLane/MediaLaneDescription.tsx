import React from 'react'
import { getComponentName } from '.'

type Props = {
    componentName: ReturnType<typeof getComponentName>
    itemCount: number
    userName?: string
    fromGroupPhase?: boolean
    isCurrent?: boolean
}

const MediaLaneDescription = (props: Props) => {
    const { componentName, itemCount, userName, fromGroupPhase } = props
    return (
        <div className="multilane__medialane-description">
            {componentName} ({itemCount}) - {fromGroupPhase ? 'Gruppe von' : ''} {userName ?? '<unbekannt>'}
        </div>
    )
}

export default React.memo(MediaLaneDescription)
