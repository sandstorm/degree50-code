import React from 'react'

type Props = {
    text: string
    updateText: (event: React.ChangeEvent<HTMLTextAreaElement>) => void
}

const TextField = ({ text, updateText }: Props) => {
    return (
        <div className="video-editor__media-item-list__column video-editor__media-item-list__column--text">
            <textarea
                placeholder={'Text einfügen'}
                maxLength={200}
                spellCheck={false}
                className="textarea"
                value={unescape(text)}
                onChange={updateText}
            />
        </div>
    )
}

export default React.memo(TextField)
