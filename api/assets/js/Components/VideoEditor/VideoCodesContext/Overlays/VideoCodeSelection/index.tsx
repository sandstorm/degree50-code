import React, { FC } from 'react'
import { connect } from 'react-redux'
import Radio from './Radio'
import RadioGroup from './RadioGroup'
import { selectors, VideoEditorState } from 'Components/VideoEditor/VideoEditorSlice'

type OwnProps = {
    defaultPrototypeId: string
    onSelect: (prototypeId: string) => void
    selectedPrototypeId?: string | null
}

const mapStateToProps = (state: VideoEditorState) => ({
    prototypes: selectors.data.selectDenormalizedPrototypes(state),
    prototypesById: selectors.data.videoCodePrototypes.selectById(state),
})

type Props = OwnProps & ReturnType<typeof mapStateToProps>

const VideoCodeSelection: FC<Props> = (props) => {
    const { onSelect, defaultPrototypeId, selectedPrototypeId, prototypes } = props

    if (prototypes.length < 1) {
        return <p>Es stehen keine Codes zur Verfügung</p>
    }

    return (
        <RadioGroup
            className="video-code-select"
            onChange={onSelect}
            defaultValue={defaultPrototypeId}
            value={selectedPrototypeId ?? undefined}
            label="Codeauswahl"
        >
            {prototypes.map((prototype) => {
                const parentPrototype =
                    prototype.parentId !== undefined ? props.prototypesById[prototype.parentId] : undefined

                return (
                    <Radio
                        key={prototype.id}
                        value={prototype.id}
                        prototype={prototype}
                        parentPrototype={parentPrototype}
                    >
                        {prototype.name}
                    </Radio>
                )
            })}
        </RadioGroup>
    )
}

export default connect(mapStateToProps)(React.memo(VideoCodeSelection))
