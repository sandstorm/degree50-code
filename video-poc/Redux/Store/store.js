import { configureStore } from '@reduxjs/toolkit'
import { cutlistSlice } from './cutlistReducer'

const store = configureStore({
  reducer: { cutlist: cutlistSlice.reducer }
})

export default store
