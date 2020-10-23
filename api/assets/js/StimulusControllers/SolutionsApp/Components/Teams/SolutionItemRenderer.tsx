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
    showVideoCodesModal?: () => void
}

const SolutionItemRenderer: React.FC<Props> = ({
    solutionFilter,
    mediaItems,
    updateCurrentTime,
    renderConfig,
    showVideoCodesModal,
}) => {
    return solutionFilter.visible ? (
        <div className={'team__solution'}>
            <div className={'team__solution-headline'}>
                <h5>
                    {solutionFilter.label} (Anzahl: {mediaItems.length})
                </h5>
                {showVideoCodesModal ? (
                    <button onClick={showVideoCodesModal} className={'btn btn-link btn-sm'}>
                        verwendete Video-Codes anzeigen
                    </button>
                ) : null}
            </div>
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
