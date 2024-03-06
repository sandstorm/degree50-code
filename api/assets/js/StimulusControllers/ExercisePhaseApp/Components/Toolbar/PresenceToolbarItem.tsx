import { Component } from './Toolbar'
import { selectors } from 'StimulusControllers/ExerciseAndSolutionStore/rootSlice'
import { useAppSelector } from 'StimulusControllers/ExerciseAndSolutionStore/hooks'

type ToolbarItemProps = {
  component: Component
  toggleComponent: (component: Component) => void
}

export function PresenceToolbarItem({
  component,
  toggleComponent,
}: ToolbarItemProps) {
  const onlineTeamMembers = useAppSelector(
    selectors.presence.selectOnlineTeamMemberIds
  )

  return (
    <button
      className={'toolbar-item button button--type-primary'}
      title={component.label}
      aria-label={component.label}
      onClick={() => toggleComponent(component)}
    >
      <span className={'toolbar-item__counter'}>
        {onlineTeamMembers.length}
      </span>
      <i className={component.icon} />
    </button>
  )
}
