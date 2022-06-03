import {
  actions,
  selectors,
} from 'StimulusControllers/ExerciseAndSolutionStore/rootSlice'
import React from 'react'
import { connect } from 'react-redux'
import MenuButton from '../components/MenuButton'
import MenuItem from '../components/MenuItem'
import { AppState } from 'StimulusControllers/ExerciseAndSolutionStore/Store'

const prefix = 'SOLUTION_FILTER'

export const SolutionFilterOverlayIds = {
  filterSolutions: `${prefix}/filterSolutions`,
}

const mapStateToProps = (state: AppState) => {
  return {
    hasNoPreviousSolutions:
      selectors.data.solutions.selectPreviousIds(state).length === 0,
  }
}

const mapDispatchToProps = {
  setOverlay: actions.videoEditor.overlay.setOverlay,
}

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps

const FilterMenu = (props: Props) => {
  const solutionsFilterLabel = 'Lösungs-Filter anpassen'

  return (
    <div className="video-editor__menu">
      <MenuButton
        icon={<i className="fas fa-filter" />}
        ariaLabel="Filter"
        disabled={props.hasNoPreviousSolutions}
      >
        <MenuItem
          ariaLabel={solutionsFilterLabel}
          label={solutionsFilterLabel}
          onClick={() =>
            props.setOverlay({
              overlayId: SolutionFilterOverlayIds.filterSolutions,
              closeOthers: true,
            })
          }
        />
      </MenuButton>
    </div>
  )
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(React.memo(FilterMenu))
