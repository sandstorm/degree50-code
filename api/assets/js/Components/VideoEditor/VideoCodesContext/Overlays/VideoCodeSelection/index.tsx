import { selectors, VideoCodePoolStateSlice } from 'Components/VideoEditor/VideoCodesContext/VideoCodePoolSlice'
import React, { useCallback } from 'react'
import { connect } from 'react-redux'
import Radio from './Radio'
import RadioGroup from './RadioGroup'

type OwnProps = {
    defaultPrototypeId: string
    onSelect: (prototypeId: string) => void
    selectedPrototypeId?: string | null
}

const mapStateToProps = (state: VideoCodePoolStateSlice) => ({
    prototoypes: selectors.selectDenormalizedVideoCodes(state),
})

const mapDispatchToProps = {}

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & OwnProps

const VideoCodeSelection = React.memo(({ prototoypes, selectedPrototypeId, onSelect, defaultPrototypeId }: Props) => {
    // 2. Render color panel
    // 3. Render lock

    const handleSelect = useCallback(
        (value: string) => {
            onSelect(value)
        },
        [selectedPrototypeId]
    )

    if (prototoypes.length < 1) {
        return <p>Es stehen keine Codes zur Verfügung</p>
    }

    return (
        <RadioGroup
            className="video-code-select"
            onChange={handleSelect}
            defaultValue={defaultPrototypeId}
            value={selectedPrototypeId ?? undefined}
            label="Codeauswahl"
        >
            {prototoypes.map((prototype) => {
                return (
                    <Radio key={prototype.id} value={prototype.id} prototype={prototype}>
                        {prototype.name}
                    </Radio>
                )
            })}
        </RadioGroup>
    )
})

export default connect(mapStateToProps, mapDispatchToProps)(VideoCodeSelection)
