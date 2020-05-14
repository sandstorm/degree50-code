import React, { useEffect, useState } from 'react';

export default function(props) {
    const [activeName, setActiveName] = useState('');

    useEffect(() => {
        setTimeout(() => setActiveName('subtitle-editor-dialog__inner--active'), 100);
    }, []);

    return (
        <div className="subtitle-editor-dialog" onClick={() => props.onClose()}>
            <div
                style={{ width: props.width || 500 }}
                className={`subtitle-editor-dialog__inner ${activeName}`}
                onClick={event => event.stopPropagation()}
            >
                <div className="subtitle-editor-dialog__title">
                    {props.title || 'Title'}{' '}
                    <i className="subtitle-editor-dialog__cancel icon-cancel" onClick={() => props.onClose()}></i>
                </div>
                <div className="subtitle-editor-dialog__content">{props.children}</div>
            </div>
        </div>
    );
}
