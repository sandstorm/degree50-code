import React from 'react'
import { useVideoFavoritesQuery } from 'StimulusControllers/Schreibtisch/Store/SchreibtischApi'
import VideoTile from './VideoTile'

const VideoFavorites = () => {
  const { data, isFetching, error } = useVideoFavoritesQuery()

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
    return <p className="video-favorites">Keine Videos favorisiert</p>
  }

  // TODO: a11y
  return (
    <ul data-test-id="video-favorites" className="tiles video-favorites">
      {data.map((videoFavorite) => (
        <li key={videoFavorite.id}>
          <VideoTile video={videoFavorite.video} />
        </li>
      ))}
    </ul>
  )
}

export default React.memo(VideoFavorites)
