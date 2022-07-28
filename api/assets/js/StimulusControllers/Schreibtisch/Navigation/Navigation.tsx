import React from 'react'
import {
  ROUTE_AUFGABEN,
  ROUTE_VIDEO_FAVORITEN,
  ROUTE_MATERIALIEN,
} from '../Schreibtisch'
import NavElement from './NavElement'

const Navigation = () => {
  return (
    <nav className="sidebar-navigation sidebar">
      <div className="sidebar__content">
        <div className="sidebar__group">
          <div className="sidebar__group-body">
            <ul className="list">
              <NavElement to={ROUTE_AUFGABEN}>
                <i className="fas fa-rectangle-list"></i>
                Meine Aufgaben
              </NavElement>

              <NavElement to={ROUTE_VIDEO_FAVORITEN}>
                <i className="fas fa-film"></i>
                Meine Videofavoriten
              </NavElement>

              <NavElement to={ROUTE_MATERIALIEN}>
                <i className="fas fa-square-quote"></i>
                Meine Materialien
              </NavElement>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default React.memo(Navigation)
