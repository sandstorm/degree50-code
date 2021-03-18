import React, { useCallback } from 'react'

type Props = {
    id?: string
    text: string
    updateText: (text: string) => void
}

const TextField = ({ id, text, updateText }: Props) => {
    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        updateText(unescape(event.target.value))
    }

    return (
        <div className="video-editor__media-item-list__column video-editor__media-item-list__column--text">
            <textarea
                id={id}
                placeholder={'Text einfügen'}
                maxLength={200}
                spellCheck={false}
                className="textarea"
                value={unescape(text)}
                onChange={handleChange}
            />
        </div>
    )
}

export default React.memo(TextField)
