import { combineReducers } from '@reduxjs/toolkit'
import { SchreibtischApi } from 'StimulusControllers/Schreibtisch/Store/SchreibtischApi'

export const RootSlice = combineReducers({
  [SchreibtischApi.reducerPath]: SchreibtischApi.reducer,
})
