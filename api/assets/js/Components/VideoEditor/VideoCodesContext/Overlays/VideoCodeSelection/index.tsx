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
    prototoypes: selectors.data.selectDenormalizedPrototypes(state),
})

type Props = OwnProps & ReturnType<typeof mapStateToProps>

const VideoCodeSelection: FC<Props> = (props) => {
    const { onSelect, defaultPrototypeId, selectedPrototypeId, prototoypes } = props

    if (prototoypes.length < 1) {
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
            {prototoypes.map((prototype) => {
                return (
                    <Radio
                        key={prototype.id}
                        value={prototype.id}
                        prototype={prototype}
                        aria-label={prototype.userCreated ? 'Selbsterstellter Code' : 'Vordefinierter Code'}
                    >
                        {prototype.name}
                    </Radio>
                )
            })}
        </RadioGroup>
    )
}

export default connect(mapStateToProps)(React.memo(VideoCodeSelection))
