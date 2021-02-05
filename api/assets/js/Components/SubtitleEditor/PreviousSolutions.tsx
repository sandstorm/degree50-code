import React, { useState } from 'react'
import { solveConflicts } from '../VideoEditor/utils/solveItemConflicts'
import { MediaItem, VideoListsState } from '../VideoEditor/types'
import { RenderConfig } from '../VideoEditor/components/MediaLane/MediaTrack'
import ReadOnlyMediaLane from '../VideoEditor/components/ReadOnlyMediaLane'

type Props = {
    handleLaneClick: (clickTime: number) => void
    renderConfig: RenderConfig
    previousSolutions?: Array<{ userId: string; userName: string; solution: VideoListsState }>
}

const PreviousSolutions = ({ previousSolutions, handleLaneClick, renderConfig }: Props) => {
    const [activePreviousSolution, setActivePreviousSolution] = useState(0)

    const handlePreviousSolutionChange = (newActivePreviousSolution: number) => {
        return setActivePreviousSolution(newActivePreviousSolution)
    }

    return (
        <div className={'previous-solutions'}>
            {previousSolutions && previousSolutions[activePreviousSolution] ? (
                <>
                    <header className={'previous-solutions__header'}>
                        <button
                            title={'Zeige vorherige Lösung'}
                            className={'btn btn-primary'}
                            disabled={!previousSolutions[activePreviousSolution - 1]}
                            onClick={() => {
                                handlePreviousSolutionChange(activePreviousSolution - 1)
                            }}
                        >
                            <i className={'fas fa-chevron-left'} /> Vorherige Lösung
                        </button>
                        <span>Lösung von: {previousSolutions[activePreviousSolution].userName}</span>
                        <button
                            title={'Zeige nächste Lösung'}
                            className={'btn btn-primary'}
                            disabled={!previousSolutions[activePreviousSolution + 1]}
                            onClick={() => {
                                handlePreviousSolutionChange(activePreviousSolution + 1)
                            }}
                        >
                            Nächste Lösung <i className={'fas fa-chevron-right'} />
                        </button>
                    </header>
                    <ReadOnlyMediaLane
                        updateCurrentTime={handleLaneClick}
                        mediaItems={solveConflicts(
                            previousSolutions[activePreviousSolution].solution.videoCodes.map(
                                (videoCode) =>
                                    new MediaItem({
                                        start: videoCode.start,
                                        end: videoCode.end,
                                        text: videoCode.text,
                                        memo: videoCode.memo,
                                        color: videoCode.color,
                                        originalData: videoCode,
                                        lane: 0,
                                    })
                            )
                        )}
                        showTextInMediaItems={false}
                        renderConfig={renderConfig}
                    />
                    <ReadOnlyMediaLane
                        updateCurrentTime={handleLaneClick}
                        mediaItems={solveConflicts(
                            previousSolutions[activePreviousSolution].solution.annotations.map(
                                (annotation) =>
                                    new MediaItem({
                                        start: annotation.start,
                                        end: annotation.end,
                                        text: annotation.text,
                                        memo: annotation.memo,
                                        color: annotation.color,
                                        originalData: annotation,
                                        lane: 0,
                                    })
                            )
                        )}
                        showTextInMediaItems={true}
                        renderConfig={{ ...renderConfig, drawRuler: false }}
                    />
                </>
            ) : null}
        </div>
    )
}

export default React.memo(PreviousSolutions)
