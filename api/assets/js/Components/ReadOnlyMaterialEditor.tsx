import React from 'react'
import { useAppSelector } from 'StimulusControllers/ExerciseAndSolutionStore/hooks'
import MaterialEditor from './MaterialEditor'
import { selectors } from 'StimulusControllers/ExerciseAndSolutionStore/rootSlice'

const ReadOnlyMaterialEditor = () => {
  const material = useAppSelector(
    selectors.data.selectMaterialOfCurrentSolution
  )

  return <MaterialEditor material={material?.material} readonly />
}

export default React.memo(ReadOnlyMaterialEditor)
