import React from 'react'
import { Component } from './Toolbar'
import Button from 'Components/Button/Button'

type ToolbarItemProps = {
  component: Component
  toggleComponent: (component: Component) => void
}

export function ToolbarItem({ component, toggleComponent }: ToolbarItemProps) {
  return (
    <Button
      onPress={() => toggleComponent(component)}
      aria-label={component.label}
      className={'toolbar-item btn btn-primary'}
    >
      <i className={component.icon} />
    </Button>
  )
}
