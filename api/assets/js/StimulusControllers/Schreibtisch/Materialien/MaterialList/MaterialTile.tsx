import { format } from 'date-fns'
import React from 'react'
import { NavLink } from 'react-router-dom'
import { ROUTE_EDIT_MATERIAL } from 'StimulusControllers/Schreibtisch/Schreibtisch'
import { Material } from 'StimulusControllers/Schreibtisch/types'

type Props = {
  material: Material
}

const MaterialTile = (props: Props) => {
  const { material } = props

  const createdAt = format(new Date(material.createdAt.date), 'dd.MM.yyyy')

  return (
    <NavLink
      tabIndex={0}
      className="tile"
      title={material.originalExercisePhaseName}
      to={`${ROUTE_EDIT_MATERIAL}/${material.id}`}
    >
      <div className="tile__content">
        <i className="tile__icon fas fa-square-quote"></i>
        Material von Phase: "{material.originalExercisePhaseName}"
        <p>Erstellt am: {createdAt}</p>
      </div>
    </NavLink>
  )
}

export default React.memo(MaterialTile)
