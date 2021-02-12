import React, { ChangeEvent, FC, memo } from 'react'

type Props = {
    duration: number
    currentTime: number
    setCurrentTime: (time: number) => void
}

const ProgressControl: FC<Props> = (props) => {
    // TODO: compute step based on duration or use fixed value?
    const step = 1

    const handleProgressInputChange = (ev: ChangeEvent<HTMLInputElement>) => {
        props.setCurrentTime(parseFloat(ev.target.value))
    }

    const handleProgressKeyDown = (ev: React.KeyboardEvent<HTMLInputElement>) => {
        // TODO: which combinations are _wanted_?
        const forwardsKeyCombination = ev.key === 'ArrowRight'
        const backwardsKeyCombination = ev.key === 'ArrowLeft'

        switch (true) {
            case forwardsKeyCombination:
                props.setCurrentTime(props.currentTime + step)
                ev.preventDefault()
                break
            case backwardsKeyCombination:
                props.setCurrentTime(props.currentTime - step)
                ev.preventDefault()
                break
            default:
            // ignore other keys
        }
    }

    return (
        <div className="video-context-player__control video-context-player__control__progress">
            <input
                type="range"
                title="Progress"
                min={0}
                step={0.001}
                max={props.duration}
                value={props.currentTime}
                aria-label="Progress"
                onChange={handleProgressInputChange}
                onKeyDown={handleProgressKeyDown}
            />
        </div>
    )
}

export default memo(ProgressControl)
