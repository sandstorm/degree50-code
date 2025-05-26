import React from 'react'

const FAQ_URL = 'https://degree.tu-dortmund.de/videoplattform/faq-zur-plattform/'

const FAQButton = () => {
    return (
        <div className="video-editor-menu">
            <a
                title="Öffne das FAQ"
                className="button button--type-primary video-editor__toolbar__button"
                href={FAQ_URL}
                target="_blank"
                rel="noreferrer"
            >
                <i className="fas fa-question" />
            </a>
        </div>
    )
}

export default React.memo(FAQButton)
