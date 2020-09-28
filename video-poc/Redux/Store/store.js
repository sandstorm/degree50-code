import { configureStore } from '@reduxjs/toolkit'
import { cutListSlice } from './cutListReducer'

const store = configureStore({
  reducer: { cutList: cutListSlice.reducer }
})

export default store
