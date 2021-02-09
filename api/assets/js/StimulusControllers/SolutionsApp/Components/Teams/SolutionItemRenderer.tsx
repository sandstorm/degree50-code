import React from 'react'
import { SolutionFilterType } from '../../SolutionsApp'
import { Annotation, VideoCode, Cut } from '../../../../Components/VideoEditor/types'
import { TabsTypesEnum } from '../../../../types'
import { RenderConfig } from '../../../../Components/VideoEditor/components/MediaLane/MediaTrack'
import ReadOnlyMediaLane from 'StimulusControllers/SolutionsApp/Components/Teams/ReadOnlyMediaLane.tsx'

type Props = {
    solutionFilter: SolutionFilterType
    entities: Array<Annotation | VideoCode | Cut>
    updateCurrentTime: (time: number) => void
    renderConfig: RenderConfig
    showVideoCodesModal?: () => void
}

const SolutionItemRenderer: React.FC<Props> = ({
    solutionFilter,
    entities,
    updateCurrentTime,
    renderConfig,
    showVideoCodesModal,
}) => {
    return solutionFilter.visible ? (
        <div className={'team__solution'}>
            <div className={'team__solution-headline'}>
                <h5>
                    {solutionFilter.label} (Anzahl: {entities.length})
                </h5>
                {showVideoCodesModal ? (
                    <button onClick={showVideoCodesModal} className={'btn btn-primary btn-sm'}>
                        verwendete Video-Codes anzeigen
                    </button>
                ) : null}
            </div>
            {entities.length > 0 ? (
                <ReadOnlyMediaLane
                    updateCurrentTime={updateCurrentTime}
                    entities={entities}
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
