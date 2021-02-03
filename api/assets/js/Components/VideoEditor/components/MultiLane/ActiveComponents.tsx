import React, { useCallback } from 'react'
import { Component } from './Filter'
import { getComponentName } from './index'

type Props = {
    components: Component[]
    setActiveComponents: (components: Component[]) => void
}

const ActiveComponents = (props: Props) => {
    const handleComponentToggle = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const updatedComponents = props.components.map((c) => {
                if (c.id === e.currentTarget.value) {
                    return {
                        ...c,
                        visible: !c.visible,
                    }
                }

                return c
            })

            props.setActiveComponents(updatedComponents)
        },
        [props.components, props.setActiveComponents]
    )

    return (
        <div className="multilane-filter__components">
            <h2>Aktive Komponenten</h2>
            <ul>
                {props.components.map((c) => (
                    <li key={c.id}>
                        <label htmlFor={c.id}>
                            <input
                                id={c.id}
                                type="checkbox"
                                key={c.id}
                                checked={c.visible}
                                onChange={handleComponentToggle}
                                value={c.id}
                            />
                            {getComponentName(c.id)}
                        </label>
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default React.memo(ActiveComponents)
