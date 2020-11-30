import React, { useCallback } from 'react'

type Props = {
    text: string
    updateText: (text: string) => void
}

const TextField = ({ text, updateText }: Props) => {
    const handleChange = useCallback(
        (event: React.ChangeEvent<HTMLTextAreaElement>) => {
            updateText(event.target.value)
        },
        [updateText]
    )

    return (
        <div className="video-editor__media-item-list__column video-editor__media-item-list__column--text">
            <textarea
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
