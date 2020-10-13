import React from 'react'
import { SolutionFilterType } from '../../SolutionsApp'

type SolutionFilterProps = {
    solutionFilters: Array<SolutionFilterType>
    setVisibleSolutionFilters: (solutionsFilters: Array<SolutionFilterType>) => void
}

const SolutionFilter = (props: SolutionFilterProps) => {
    const handleOnChange = (targetSolutionFilter: SolutionFilterType, show: boolean) => {
        props.setVisibleSolutionFilters(
            props.solutionFilters.map((solutionFilter: SolutionFilterType) => {
                return {
                    ...solutionFilter,
                    ...(solutionFilter === targetSolutionFilter ? { visible: show } : {}),
                }
            })
        )
    }

    return (
        <ul className={'solutions-filter'}>
            {props.solutionFilters.map((solutionFilter: SolutionFilterType) => (
                <li key={solutionFilter.id} className={'form-check solutions-filter__entry'}>
                    <input
                        className={'form-check-input'}
                        id={solutionFilter.id}
                        type={'checkbox'}
                        checked={solutionFilter.visible}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                            handleOnChange(solutionFilter, event.currentTarget.checked)
                        }}
                    />
                    <label className={'form-check-label'} htmlFor={solutionFilter.id}>
                        {solutionFilter.label}
                    </label>
                </li>
            ))}
        </ul>
    )
}

export default React.memo(SolutionFilter)
