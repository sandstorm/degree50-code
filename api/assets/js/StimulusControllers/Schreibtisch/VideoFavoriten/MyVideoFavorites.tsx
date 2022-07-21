import React from 'react'
import VideoFavorites from './VideoFavorites/VideoFavorites'

const MyVideoFavorites = () => {
  return (
    <>
      <header>Meine Videofavoriten</header>
      <VideoFavorites />
    </>
  )
}

export default React.memo(MyVideoFavorites)
