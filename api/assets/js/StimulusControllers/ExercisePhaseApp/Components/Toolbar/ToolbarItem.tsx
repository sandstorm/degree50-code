import React from 'react'
import { Component } from './Toolbar'

type Props = {
    component: Component
    toggleComponent: (component: Component) => void
}

export function ToolbarItem({ component, toggleComponent }: Props) {
    return (
        <div
            className={'toolbar-item'}
            title={component.label}
            aria-label={component.label}
            onClick={() => toggleComponent(component)}
        >
            <i className={component.icon}></i>
        </div>
    )
}
