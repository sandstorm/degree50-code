import React from 'react';

type Props = {
    componentId: string,
    activeToolbarItem: string,
    toggleComponent: (componentId: string) => void
}

const components: object = {
    'task': {
        'label': 'Aufgabenstellung',
        'icon': 'fas fa-tasks'
    },
    'videoPlayer': {
        'label': 'Video-Player'
    },
    'documentUpload': {
        'label': 'Dokumenten-Upload'
    },
    'videoCode': {
        'label': 'Video-Kodierung'
    }
}

export function ToolbarItem({componentId, activeToolbarItem, toggleComponent}: Props) {
    const component = components[componentId];
    return (
        <div className={(componentId == activeToolbarItem) ? 'toolbar-item toolbar-item--active' : 'toolbar-item'} title={component.label} aria-label={component.label} onClick={() => toggleComponent(componentId)}>
            <i className={component.icon}></i>
        </div>
    );
}