import React, { useRef } from 'react'
import {
  useAppDispatch,
  useAppSelector,
} from 'StimulusControllers/ExerciseAndSolutionStore/hooks'
import {
  actions,
  selectors,
} from 'StimulusControllers/ExerciseAndSolutionStore/rootSlice'
import { syncSolutionAction } from 'StimulusControllers/ExercisePhaseApp/Components/Solution/SolutionSaga'
import { Material } from 'StimulusControllers/ExerciseAndSolutionStore/MaterialsSlice'
import MaterialEditor from './MaterialEditor'

const EditMaterialEditor = () => {
  const material = useAppSelector(
    selectors.data.selectMaterialOfCurrentSolution
  )

  const isReadonly = !useAppSelector(selectors.selectUserIsCurrentEditor)

  const initialMaterial = useRef(material?.material ?? '')

  const dispatch = useAppDispatch()

  const handleChange = (newValue: string) => {
    if (material !== undefined) {
      const updatedMaterial: Material = {
        ...material,
        material: newValue,
      }

      dispatch(
        actions.data.materials.updateMaterial({ material: updatedMaterial })
      )
      dispatch(syncSolutionAction())
    }
  }

  return (
    <MaterialEditor
      material={initialMaterial.current}
      onChange={handleChange}
      readonly={isReadonly}
    />
  )
}

export default React.memo(EditMaterialEditor)
