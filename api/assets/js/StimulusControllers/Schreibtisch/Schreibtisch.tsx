import { HashRouter, Routes, Route, Navigate, NavLink } from 'react-router-dom'
import MyExercises from 'StimulusControllers/Schreibtisch/Aufgaben/MyExercises'
import MyVideoFavorites from './VideoFavoriten/MyVideoFavorites'

const ROUTE_AUFGABEN = '/aufgaben'
const ROUTE_VIDEO_FAVORITEN = '/video-favoriten'
const ROUTE_MATERIALIEN = '/materialien'

const Schreibtisch = () => {
  return (
    <div className="schreibtisch">
      <HashRouter>
        <nav>
          <NavLink to={ROUTE_AUFGABEN}>Meine Aufgaben</NavLink>
          <NavLink to={ROUTE_VIDEO_FAVORITEN}>Meine Videofavoriten</NavLink>
          <NavLink to={ROUTE_MATERIALIEN}>Meine Materialien</NavLink>
        </nav>
        <main>
          <Routes>
            <Route
              index
              element={<Navigate to={ROUTE_AUFGABEN} replace={true} />}
            />
            <Route path={ROUTE_AUFGABEN} element={<MyExercises />} />
            <Route
              path={ROUTE_VIDEO_FAVORITEN}
              element={<MyVideoFavorites />}
            />
            <Route path={ROUTE_MATERIALIEN} element={'Meine Materialien'} />
          </Routes>
        </main>
      </HashRouter>
    </div>
  )
}

export default Schreibtisch
