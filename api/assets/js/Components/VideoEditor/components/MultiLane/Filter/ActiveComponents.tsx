import React, { useCallback } from 'react'
import { getComponentName } from '../index'
import { FilterStateSlice } from '../../../FilterContext/FilterSlice'
import { selectors, actions } from 'Components/VideoEditor/VideoEditorSlice'
import { connect } from 'react-redux'

const mapStateToProps = (state: FilterStateSlice) => {
    return {
        components: selectors.filter.selectComponents(state),
    }
}

const mapDispatchToProps = {
    toggleComponent: actions.filter.toggleComponent,
}

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps

const ActiveComponents = (props: Props) => {
    const handleToggle = useCallback(
        (ev: React.ChangeEvent<HTMLInputElement>) => {
            props.toggleComponent(ev.currentTarget.value)
        },
        [props.toggleComponent]
    )

    return (
        <div className="multilane-filter__components">
            <h2>Aktive Komponenten:</h2>
            <ul>
                {props.components.map((c) => (
                    <li key={c.id}>
                        <label htmlFor={c.id}>
                            <input
                                id={c.id}
                                type="checkbox"
                                key={c.id}
                                checked={c.isVisible}
                                onChange={handleToggle}
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

export default connect(mapStateToProps, mapDispatchToProps)(React.memo(ActiveComponents))
