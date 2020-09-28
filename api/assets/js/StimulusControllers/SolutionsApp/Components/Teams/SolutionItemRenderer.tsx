import React from 'react'
import { SolutionFilterType } from '../../SolutionsApp'
import { MediaItem } from '../../../../Components/VideoEditor/Editors/components/types'
import ReadOnlyMediaLane from '../../../../Components/VideoEditor/Editors/components/ReadOnlyMediaLane'
import { TabsTypesEnum } from '../../../../types'
import { RenderConfig } from '../../../../Components/VideoEditor/Editors/components/MediaLane/MediaTrack'

type Props = {
    solutionFilter: SolutionFilterType
    mediaItems: Array<MediaItem<any>>
    updateCurrentTime: (time: number) => void
    renderConfig: RenderConfig
}

const SolutionItemRenderer: React.FC<Props> = ({ solutionFilter, mediaItems, updateCurrentTime, renderConfig }) => {
    return solutionFilter.visible ? (
        <div className={'team__solution'}>
            <h5 className={'team__solution-headline'}>
                {solutionFilter.label} (Anzahl: {mediaItems.length})
            </h5>
            {mediaItems.length > 0 ? (
                <ReadOnlyMediaLane
                    updateCurrentTime={updateCurrentTime}
                    mediaItems={mediaItems}
                    showTextInMediaItems={solutionFilter.id === TabsTypesEnum.VIDEO_ANNOTATIONS}
                    renderConfig={renderConfig}
                />
            ) : (
                <p>Kein Ergebnis vorhanden</p>
            )}
        </div>
    ) : null
}

export default React.memo(SolutionItemRenderer)
