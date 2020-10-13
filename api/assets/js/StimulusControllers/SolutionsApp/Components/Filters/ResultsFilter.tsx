import React, { useState } from 'react'
import { SolutionByTeam } from '../../SolutionsApp'

type ResultsFilterProps = {
    solutions: Array<SolutionByTeam>
    setVisibleSolutions: (solutions: Array<SolutionByTeam>) => void
}

const ResultsFilter = (props: ResultsFilterProps) => {
    const [allSolutionsVisible, setAllSolutionsVisible] = useState<boolean>(true)

    const handleToggleAllSolutions = (event: React.ChangeEvent<HTMLInputElement>) => {
        props.setVisibleSolutions(
            props.solutions.map((solutionsEntry: SolutionByTeam) => {
                return {
                    ...solutionsEntry,
                    visible: event.target.checked,
                }
            })
        )
        setAllSolutionsVisible(event.target.checked)
    }
    const handleSolutionsFilterOnChange = (targetSolutionsEntry: SolutionByTeam, show: boolean) => {
        props.setVisibleSolutions(
            props.solutions.map((solutionsEntry: SolutionByTeam) => {
                return {
                    ...solutionsEntry,
                    ...(solutionsEntry === targetSolutionsEntry ? { visible: show } : {}),
                }
            })
        )
    }

    return (
        <ul className={'solutions-filter'}>
            <li key={'toggle-all-solutions'} className={'form-check solutions-filter__entry'}>
                <input
                    className={'form-check-input'}
                    id={'toggle-all-solutions'}
                    type={'checkbox'}
                    checked={allSolutionsVisible}
                    onChange={handleToggleAllSolutions}
                />
                <label className={'form-check-label'} htmlFor={'toggle-all-solutions'}>
                    Alle
                </label>
            </li>
            {props.solutions.map((solutionsEntry: SolutionByTeam) => (
                <li key={solutionsEntry.teamCreator} className={'form-check solutions-filter__entry'}>
                    <input
                        className={'form-check-input'}
                        id={solutionsEntry.teamCreator}
                        type={'checkbox'}
                        checked={solutionsEntry.visible}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                            handleSolutionsFilterOnChange(solutionsEntry, event.currentTarget.checked)
                        }}
                    />
                    <label className={'form-check-label'} htmlFor={solutionsEntry.teamCreator}>
                        {solutionsEntry.teamCreator}
                    </label>
                </li>
            ))}
        </ul>
    )
}

export default React.memo(ResultsFilter)
