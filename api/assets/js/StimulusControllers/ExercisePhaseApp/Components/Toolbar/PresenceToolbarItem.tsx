import React from 'react'
import { Component } from './Toolbar'
import { useAppSelector } from '../../../ExerciseAndSolutionStore/Store'
import { selectors } from 'StimulusControllers/ExerciseAndSolutionStore/rootSlice'

type ToolbarItemProps = {
    component: Component
    toggleComponent: (component: Component) => void
}

export function PresenceToolbarItem({ component, toggleComponent }: ToolbarItemProps) {
    const onlineTeamMembers = useAppSelector(selectors.presence.selectOnlineTeamMemberIds)

    return (
        <button
            className={'toolbar-item btn btn-primary'}
            title={component.label}
            aria-label={component.label}
            onClick={() => toggleComponent(component)}
        >
            <span className={'toolbar-item__counter'}>{onlineTeamMembers.length}</span>
            <i className={component.icon} />
        </button>
    )
}
