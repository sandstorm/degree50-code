import React from 'react'
import { connect } from 'react-redux'
import { getComponentName } from '.'
import { TabsTypesEnum } from 'types'
import VideoCodesMedialane from 'Components/VideoEditor/VideoCodesContext/VideoCodesMedialane'

const mapStateToProps = () => ({})

const mapDispatchToProps = {}

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps

const VideoCodeLaneContainer = (props: Props) => {
    return (
        <>
            <div>
                <div className="multilane__medialane-description">{getComponentName(TabsTypesEnum.VIDEO_CODES)}</div>
                <VideoCodesMedialane />
            </div>
        </>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(React.memo(VideoCodeLaneContainer))
