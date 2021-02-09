import React from 'react'
import { connect } from 'react-redux'
import { getComponentName } from '.'
import { TabsTypesEnum } from 'types'
import VideoCutMedialane from 'Components/VideoEditor/CuttingContext/VideoCutMedialane'

const mapStateToProps = () => ({})

const mapDispatchToProps = {}

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps

const CutLaneContainer = (props: Props) => {
    return (
        <>
            <div>
                <div className="multilane__medialane-description">{getComponentName(TabsTypesEnum.VIDEO_CUTTING)}</div>
                <VideoCutMedialane />
            </div>
        </>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(React.memo(CutLaneContainer))
