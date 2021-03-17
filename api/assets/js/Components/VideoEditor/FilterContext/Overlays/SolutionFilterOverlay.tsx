import { VideoEditorState, selectors, actions } from 'Components/VideoEditor/VideoEditorSlice'
import React, { memo, useCallback } from 'react'
import { connect } from 'react-redux'
import Overlay from '../../components/Overlay'
import { SolutionFilterOverlayIds } from '../FilterMenu'
import CheckboxWithIndeterminate, { CheckboxValue } from 'Components/VideoEditor/components/CheckboxWithIndeterminate'
import { GlobalSolutionFilter } from '../FilterSlice'

const mapStateToProps = (state: VideoEditorState) => {
    const solutions = selectors.data.solutions.selectById(state)
    const previousSolutionsFromFilter = selectors.filter.selectPreviousSolutions(state)
    const previousSolutions = previousSolutionsFromFilter.map((s) => ({
        ...s,
        ...solutions[s.id],
    }))
    const globalSolutionFilter = selectors.filter.selectGlobalSolutionFilter(state)

    return {
        previousSolutions,
        globalSolutionFilter,
    }
}

const mapDispatchToProps = {
    closeOverlay: actions.overlay.unsetOverlay,
    togglePreviousSolution: actions.filter.togglePreviousSolution,
    setGlobalSolutionFilter: actions.filter.setGlobalSolutionFilter,
}

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps

const SolutionFilterOverlay = (props: Props) => {
    const close = () => {
        props.closeOverlay(SolutionFilterOverlayIds.filterSolutions)
    }

    const handleToggle = useCallback(
        (ev: React.ChangeEvent<HTMLInputElement>) => {
            props.togglePreviousSolution(ev.currentTarget.value)
        },
        [props.togglePreviousSolution]
    )

    const handleGlobalSolutionFilterChange = (value: CheckboxValue) => {
        props.setGlobalSolutionFilter(mapCheckboxValueToGlobalSolutionFilter(value))
    }

    const globalSolutionFilterCheckboxAriaLabel = `${
        props.globalSolutionFilter === GlobalSolutionFilter.ALL ? 'Alle abwählen' : 'Alle auswählen'
    }`

    return (
        <Overlay closeCallback={close} title="Aktive Lösungen">
            <div className="global-filter">
                <CheckboxWithIndeterminate
                    id="globalFilter"
                    value={mapGlobalSolutionFilterToCheckboxValue(props.globalSolutionFilter)}
                    handleChange={handleGlobalSolutionFilterChange}
                    aria-label={globalSolutionFilterCheckboxAriaLabel}
                />
                <label htmlFor="globalFilter">Alle</label>
            </div>
            <ul className="solution-filter-list">
                {props.previousSolutions.map((solution) => (
                    <li key={solution.id}>
                        <input
                            id={solution.id}
                            aria-label={`Lösung von ${solution.userName ?? '<unbekannter Nutzer>'}`}
                            type="checkbox"
                            key={solution.id}
                            checked={solution.isVisible}
                            onChange={handleToggle}
                            value={solution.id}
                        />
                        <label htmlFor={solution.id}>{solution.userName}</label>
                    </li>
                ))}
            </ul>
        </Overlay>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(memo(SolutionFilterOverlay))

function mapCheckboxValueToGlobalSolutionFilter(value: CheckboxValue) {
    switch (value) {
        case CheckboxValue.CHECKED:
            return GlobalSolutionFilter.ALL
        case CheckboxValue.UNCHECKED:
            return GlobalSolutionFilter.NONE
        case CheckboxValue.INDETERMINATE:
            return GlobalSolutionFilter.MIXED
    }
}

function mapGlobalSolutionFilterToCheckboxValue(value: GlobalSolutionFilter) {
    switch (value) {
        case GlobalSolutionFilter.ALL:
            return CheckboxValue.CHECKED
        case GlobalSolutionFilter.NONE:
            return CheckboxValue.UNCHECKED
        case GlobalSolutionFilter.MIXED:
            return CheckboxValue.INDETERMINATE
    }
}
