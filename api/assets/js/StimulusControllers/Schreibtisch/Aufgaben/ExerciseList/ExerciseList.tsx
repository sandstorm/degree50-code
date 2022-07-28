import { memo } from 'react'
import { useExercisesQuery } from 'StimulusControllers/Schreibtisch/Store/SchreibtischApi'
import ExerciseListItem from 'StimulusControllers/Schreibtisch/Aufgaben/ExerciseList/ExerciseListItem'

const ExerciseList = () => {
  const { data, isFetching, error } = useExercisesQuery()

  if (isFetching) {
    return (
      <div className="loading-screen">
        <i className="fas fa-spinner fa-spin"></i>
      </div>
    )
  }

  if (error || data === undefined) {
    console.error(error)
    return <p>Fehler!</p>
  }

  // TODO: a11y
  return (
    <table className="exercise-list">
      <thead>
        <tr>
          <th>Fachbereich</th>
          <th>Kurs</th>
          <th>Aufgabe</th>
          <th>Phasen</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {data.map((exercise) => (
          <ExerciseListItem key={exercise.id} exercise={exercise} />
        ))}
      </tbody>
    </table>
  )
}

export default memo(ExerciseList)
