import { memo } from 'react'
import ExerciseListItemProgress from 'StimulusControllers/Schreibtisch/Aufgaben/ExerciseList/ExerciseListItemProgress'
import { Exercise } from 'StimulusControllers/Schreibtisch/types'

type Props = {
  exercise: Exercise
}

const prettyConvertPhaseStatus = (backendStatus: Exercise['status']) => {
  switch (backendStatus) {
    case 'IN_BEARBEITUNG': {
      return 'In Bearbeitung'
    }

    case 'IN_REVIEW': {
      return 'Wird von Dozent geprüft'
    }

    case 'NEU': {
      return 'Neu'
    }

    case 'BEENDET': {
      return 'Beendet'
    }
  }
}

const ExerciseListItem = (props: Props) => {
  const { exercise } = props

  const url = `/exercise/show-overview/${exercise.id}`
  const ariaLabel = 'TODO'

  return (
    <tr aria-label={ariaLabel}>
      <td>"Fachbereich"</td>
      <td>{exercise.course}</td>
      <td>
        <a href={url}>{exercise.name}</a>
      </td>
      <td>
        <ExerciseListItemProgress
          completedPhases={exercise.completedPhases}
          phaseCount={exercise.phaseCount}
        />
      </td>
      <td className="exercise-status">
        {prettyConvertPhaseStatus(exercise.status)}
      </td>
    </tr>
  )
}

export default memo(ExerciseListItem)
