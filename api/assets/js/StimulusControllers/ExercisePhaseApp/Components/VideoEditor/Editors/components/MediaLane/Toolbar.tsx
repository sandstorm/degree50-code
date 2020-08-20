import React from 'react'
import { Translate } from 'react-i18nify'

type Props = {
    zoomHandler: (event: React.ChangeEvent<HTMLInputElement>) => void
    children?: React.ReactNode
}

const Toolbar = ({ zoomHandler, children }: Props) => {
    return (
        <div className="video-editor-timeline__header">
            <div className="video-editor-timeline__header-left">
                <div className="item">
                    <div className="name">
                        <Translate value="zoom" />
                    </div>
                    <div className="value">
                        <input defaultValue="25" type="range" min="1" max="100" step="1" onChange={zoomHandler} />
                    </div>
                </div>
                {children}
            </div>
        </div>
    )
}

export default React.memo(Toolbar)
