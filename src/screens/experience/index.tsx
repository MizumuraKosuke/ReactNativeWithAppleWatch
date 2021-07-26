import React, { useEffect } from 'react'
import {
  ScrollView,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { checkNotificationPermission } from '../../utils/notification'

import Nfc from './nfc'
import Beacon from './beacon'
import Geofencing from './geofencing'
import WithWatch from './with-watch'

import Spacer from '../../components/spacer'
import { H1 } from '../../components/text'

import styles from './experience.style'
import globalStyles from '../../utils/style'

const App = () => {
  const initNotif = async () => {
    const hasNotifPermission = await checkNotificationPermission()
    console.log('hasNotifPermission: ', hasNotifPermission)
  }

  useEffect(() => {
    initNotif()
  }, [])

  return (
    <ScrollView
      style={[
        styles.container,
        globalStyles.flex1,
      ]}
    >
      <SafeAreaView>
        <View
          style={[
            globalStyles.flex1,
            globalStyles.alignCenter,
          ]}
        >
          <View>
            <Spacer height="3rem" />
            <H1>React Native with watch app</H1>
            <Spacer height="2rem" />
            <Nfc />
            <Beacon />
            <Geofencing />
            <WithWatch />
          </View>
        </View>
      </SafeAreaView>
    </ScrollView>
  )
}

export default App
