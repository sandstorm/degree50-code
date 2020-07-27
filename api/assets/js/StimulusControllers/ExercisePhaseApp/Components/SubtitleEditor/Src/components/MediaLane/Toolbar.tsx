import React from 'react'
import { Translate } from 'react-i18nify'

type Props = {
    zoomHandler: (event: React.ChangeEvent<HTMLInputElement>) => void
}

const Toolbar = ({ zoomHandler }: Props) => {
    return (
        <div className="subtitle-editor-timeline__header">
            <div className="subtitle-editor-timeline__header-left">
                <div className="item">
                    <div className="name">
                        <Translate value="zoom" />
                    </div>
                    <div className="value">
                        <input defaultValue="10" type="range" min="5" max="20" step="1" onChange={zoomHandler} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default React.memo(Toolbar)
