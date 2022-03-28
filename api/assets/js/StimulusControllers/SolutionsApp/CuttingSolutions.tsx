import React from 'react'
import { connect } from 'react-redux'
import ConnectedVideoJSPlayer from 'Components/VideoPlayer/ConnectedVideoJSPlayer'
import { VideoEditorState, selectors as videoEditorSelectors } from 'Components/VideoEditor/VideoEditorSlice'
import {
    ConfigStateSlice,
    selectors as configSelectors,
} from 'StimulusControllers/ExercisePhaseApp/Components/Config/ConfigSlice'
import Toolbar from 'Components/VideoEditor/components/Toolbar'
import OverlayContainer from 'Components/VideoEditor/components/OverlayContainer'
import VideoCutSolutionVideo from './VideoCutSolutionVideo'

const mapStateToProps = (state: VideoEditorState & ConfigStateSlice) => ({
    videos: configSelectors.selectVideos(state),
    solutions: videoEditorSelectors.selectActiveSolutionsWithCuts(state),
})

const mapDispatchToProps = {}

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps

const CuttingSolutions = (props: Props) => {
    const firstVideo = props.videos[0]

    return (
        <div className="video-editor">
            <ConnectedVideoJSPlayer
                videoJsOptions={{
                    autoplay: false,
                    controls: true,
                    sources: [
                        {
                            src: firstVideo?.url?.hls || '',
                        },
                    ],
                    fluid: false,
                    // @ts-ignore
                    fill: true,
                }}
                videoMap={firstVideo}
            />
            <Toolbar />
            <OverlayContainer />
            <div className="cutting-solutions" data-test-id="cuttingSolutions">
                {props.solutions.map((s) => (
                    <div key={s.id} className="cutting-solution">
                        <h5>
                            {s.fromGroupPhase ? 'Lösung der Gruppe von' : 'Lösung von'} {s.userName}:
                        </h5>
                        <div className="cutting-solution__video">
                            <VideoCutSolutionVideo videoConfig={s.cutVideo} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(React.memo(CuttingSolutions))
