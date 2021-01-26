import { selectors, VideoCodePoolStateSlice } from 'Components/VideoEditor/VideoCodePoolSlice'
import React, { useCallback } from 'react'
import { connect } from 'react-redux'
import Color from './VideoCodesPool/VideoCodeEntry/Color'

type OwnProps = {
    onSelect: (prototypeId: string) => void
    selectedPrototypeId?: string | null
}

const mapStateToProps = (state: VideoCodePoolStateSlice) => ({
    prototoypes: selectors.selectVideoCodePoolList(state),
})

const mapDispatchToProps = {}

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & OwnProps

const VideoCodeSelection = React.memo(({ prototoypes, selectedPrototypeId, onSelect }: Props) => {
    // 2. Render color panel
    // 3. Render lock

    const handleSelect = useCallback(
        (ev: React.ChangeEvent<HTMLInputElement>) => {
            onSelect(ev.currentTarget.value)
        },
        [selectedPrototypeId]
    )

    if (prototoypes.length < 1) {
        return <p>Es stehen keine Codes zur Verfügung</p>
    }

    return (
        <ul className="video-code-select">
            {prototoypes.map((prototype, index) => {
                const isSelected = (() => {
                    if (!selectedPrototypeId && index === 0) {
                        return true
                    }

                    return selectedPrototypeId === prototype.id
                })()

                return (
                    <li key={prototype.id} className="video-code-select__option">
                        <input
                            type="radio"
                            name="prototypes"
                            id={prototype.id}
                            value={prototype.id}
                            checked={isSelected}
                            onChange={handleSelect}
                        />
                        {
                            !prototype.userCreated ? (
                                <i className={'video-code__locked fas fa-lock'} title={'Vorgegebener Video-Code'} />
                            ) : (
                                <i />
                            ) // dummy icon for styling purposes
                        }
                        <Color color={prototype.color} />
                        <label htmlFor={prototype.id}>{prototype.name}</label>
                    </li>
                )
            })}
        </ul>
    )
})

export default connect(mapStateToProps, mapDispatchToProps)(VideoCodeSelection)
