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
  const lastUpdatedAt = material.lastUpdatedAt
    ? format(new Date(material.lastUpdatedAt?.date), 'dd.MM.yyyy')
    : undefined

  return (
    <NavLink
      tabIndex={0}
      className="tile"
      title={material.originalExercisePhaseName}
      to={`${ROUTE_EDIT_MATERIAL}/${material.id}`}
    >
      <div className="tile__content">
        <i className="tile__icon fas fa-square-quote"></i>
        <p className="material-tile__phase-name">
          {material.originalExercisePhaseName}
        </p>
        {lastUpdatedAt ? (
          <p className="material-tile__date">
            Zuletzt geändert: {lastUpdatedAt}
          </p>
        ) : (
          <p className="material-tile__date">Erstellt am: {createdAt}</p>
        )}
      </div>
    </NavLink>
  )
}

export default React.memo(MaterialTile)
