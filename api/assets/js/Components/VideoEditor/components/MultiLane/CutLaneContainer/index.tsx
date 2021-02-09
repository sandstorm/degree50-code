import React from 'react'
import { connect } from 'react-redux'
import { getComponentName } from '..'
import { TabsTypesEnum } from 'types'
import VideoCutMedialane from 'Components/VideoEditor/components/MultiLane/CutLaneContainer/VideoCutMedialane'
import { VideoEditorState, selectors } from 'Components/VideoEditor/VideoEditorSlice'

const mapStateToProps = (state: VideoEditorState) => ({
    cuts: selectors.data.selectCurrentCutListByStartTime(state),
})

const mapDispatchToProps = {}

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps

const CutLaneContainer = (props: Props) => {
    return (
        <>
            <div>
                <div className="multilane__medialane-description">{getComponentName(TabsTypesEnum.VIDEO_CUTTING)}</div>
                <VideoCutMedialane cuts={props.cuts} />
            </div>
        </>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(React.memo(CutLaneContainer))
