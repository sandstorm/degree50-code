import React from 'react'
import { connect } from 'react-redux'
import { getComponentName } from '.'
import { TabsTypesEnum } from 'types'
import AnnotationMedialane from 'Components/VideoEditor/AnnotationsContext/AnnotationMedialane'

const mapStateToProps = () => ({})

const mapDispatchToProps = {}

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps

const AnnotationLaneContainer = (props: Props) => {
    return (
        <>
            <div>
                <div className="multilane__medialane-description">
                    {getComponentName(TabsTypesEnum.VIDEO_ANNOTATIONS)}
                </div>
                <AnnotationMedialane />
            </div>
        </>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(React.memo(AnnotationLaneContainer))
