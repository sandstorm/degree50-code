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
        <NavLink className="overview-item" to={`${ROUTE_EDIT_MATERIAL}/${material.id}`}>
            <div
                className="overview-item__date"
                aria-label={lastUpdatedAt ? 'Zuletzt geändert am: ' + lastUpdatedAt : 'Erstellt am: ' + createdAt}
            >
                {lastUpdatedAt ? lastUpdatedAt : createdAt}
            </div>
            <div className="overview-item__status">
                <i className="fas fa-square-quote"></i>
            </div>
            <div className="overview-item__title" aria-label={'Titel des Materials: ' + material.name}>
                {material.name}
            </div>
        </NavLink>
    )
}

export default React.memo(MaterialTile)
