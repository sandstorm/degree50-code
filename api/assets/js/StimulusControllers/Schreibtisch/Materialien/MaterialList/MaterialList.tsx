import React from 'react'
import { useMaterialQuery } from 'StimulusControllers/Schreibtisch/Store/SchreibtischApi'
import MaterialTile from './MaterialTile'

const MaterialList = () => {
  const { data, isFetching, error } = useMaterialQuery()

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

  if (data.length === 0) {
    return <p>Keine Materialien vorhanden</p>
  }

  // TODO a11y
  return (
    <ul data-test-id="material" className="tiles material">
      {data.map((material) => (
        <li key={material.id} className="tile">
          <MaterialTile material={material} />
        </li>
      ))}
    </ul>
  )
}

export default React.memo(MaterialList)
