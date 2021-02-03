import React, { useState } from 'react'
import { ComponentId } from 'StimulusControllers/ExercisePhaseApp/Components/Config/ConfigSlice'
import ActiveComponents from './ActiveComponents'

export type Component = { id: ComponentId; visible: boolean }

type Props = {
    components: Component[]
    setActiveComponents: (components: Component[]) => void
}

const Filter = (props: Props) => {
    const [showFilter, setShowFilter] = useState(false)
    const toggleShowFilter = () => setShowFilter(!showFilter)

    return (
        <div className="multilane-filter-container">
            {showFilter && (
                <div className="multilane-filter__content">
                    <ActiveComponents components={props.components} setActiveComponents={props.setActiveComponents} />
                </div>
            )}

            <button className="btn btn-grey btn-sm multilane-filter-container__toggle" onClick={toggleShowFilter}>
                <i className={showFilter ? 'fas fa-chevron-left' : 'fas fa-chevron-right'} />
            </button>
        </div>
    )
}

export default React.memo(Filter)
