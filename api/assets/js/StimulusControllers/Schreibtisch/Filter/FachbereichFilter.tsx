import Checkbox from 'Components/Checkbox'
import { useFachbereichQuery } from 'StimulusControllers/Schreibtisch/Store/SchreibtischApi'
import { useDispatch, useSelector } from 'react-redux'
import {
  selectActiveFachbereichFilters,
  toggleFilter,
} from 'StimulusControllers/Schreibtisch/Store/FachbereichFilterSlice'

const FachbereichFilter = () => {
  const { data, isFetching, error } = useFachbereichQuery()

  const dispatch = useDispatch()
  const fachbereiche = Object.values(data ?? {})
  const activeFilters = useSelector(selectActiveFachbereichFilters)

  const createChangeHandler = (fachbereichId: string) => () => {
    dispatch(toggleFilter(fachbereichId))
  }

  if (error) {
    return (
      <div>
        <h4>Fachbereich</h4>
        <p>Fehler!</p>
      </div>
    )
  }

  if (isFetching) {
    return (
      <div>
        <h4>Fachbereich</h4>
        <div className="loading-screen">
          <i className="fas fa-spinner fa-spin"></i>
        </div>
      </div>
    )
  }

  return (
    <div className="schreibtisch-filter">
      <h6 className="schreibtisch-filter__label">Fachbereich:</h6>
      <ul className="list">
        {fachbereiche.map((fachbereich) => (
          <li key={fachbereich.id}>
            <Checkbox
              isSelected={activeFilters.includes(fachbereich.id)}
              onChange={createChangeHandler(fachbereich.id)}
            >
              {fachbereich.name}
            </Checkbox>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default FachbereichFilter
