import React from 'react'
import { StatusBar } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import './src/constants/estyles'

import Experience from './src/screens/experience'

const App = () => {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <Experience />
    </SafeAreaProvider>
  )
}

export default App
