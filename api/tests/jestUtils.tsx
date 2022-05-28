import React from 'react'
import {
  render as rtlRender,
  screen,
  fireEvent,
  waitFor,
} from '@testing-library/react'
import { configureStore, Reducer } from '@reduxjs/toolkit'
import { Provider } from 'react-redux'

const render = (
  ui: React.ReactElement,
  {
    reducer,
    preloadedState,
    ...renderOptions
  }: {
    reducer: Reducer
    preloadedState?: any
  }
) => {
  const store = configureStore({
    reducer,
    preloadedState,
  })

  function Wrapper({ children }: { children: React.ReactElement }) {
    return <Provider store={store}>{children}</Provider>
  }

  return rtlRender(ui, { wrapper: Wrapper, ...renderOptions })
}

// re-export everything
export * from '@testing-library/react'
// override render method
export { render, screen, fireEvent, waitFor }
