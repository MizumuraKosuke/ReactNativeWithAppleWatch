import React, { useEffect, useState, useRef } from 'react'
import {
  ScrollView,
  StatusBar,
  View,
  TouchableOpacity,
  Platform,
  DeviceEventEmitter,
  Alert,
} from 'react-native'
import {
  sendMessage,
  watchEvents,
  getReachability,
} from 'react-native-watch-connectivity'
import NfcManager, { NfcEvents, NfcTech, Ndef } from 'react-native-nfc-manager'
import NoTypeBeacons from 'react-native-beacons-manager'
import Geolocation from '@react-native-community/geolocation'
import EStyleSheet from 'react-native-extended-stylesheet'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'

import Notifications, { checkNotificationPermission } from './src/utils/notification'

import './src/constants/estyles'

import Spacer from './src/components/spacer'
import { H1, H2, H3, H4 } from './src/components/text'
import globalStyles from './src/utils/style'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Beacons: any = NoTypeBeacons

const styles = EStyleSheet.create({
  titleTxt: {
    color: '#ff743d',
  },
  btn: {
    backgroundColor: '#08b79b',
    borderRadius: 22,
    paddingVertical: '.75rem',
    paddingHorizontal: '2rem',
    minWidth: '7rem',
  },
  btnTxt: {
    color: '$white',
  },
  response: {
    backgroundColor: '#eaeaea',
    borderRadius: 10,
    paddingVertical: '.75rem',
    paddingHorizontal: '1rem',
  },
})

const regions = [
  {
    identifier: 'ibeacon-test',
    uuid: '9c8a7cea-b59d-4f74-843a-0f84a567b131',
  },
  {
    identifier: 'SOL_beacon_1',
    uuid: 'fda50693-a4e2-4fb1-afcf-c6eb07647825',
  },
]

const TARGET_LOCATION = {
  lat: 35.66328287640385,
  lng: 139.66925727669064,
}
const RADIUS = 10
const radians = (deg: number) => {
  return deg * Math.PI / 180
}
const getDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  return 6371
    * Math.acos(Math.cos(radians(lat1))
      * Math.cos(radians(lat2))
      * Math.cos(radians(lng2) - radians(lng1))
      + Math.sin(radians(lat1))
      * Math.sin(radians(lat2))) * 1000
}

const App = () => {
  const [ messages, setMessages ] = useState([])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const messagesRef = useRef<any>([])
  const regionDataRef = useRef<any>([])
  const watchId = useRef<number>(0)
  const isEnterRef = useRef(false)

  const [ regionData, setRegionData ] = useState<any>(regionDataRef.current)
  const [ isWatchingBeacon, setWatchingBeacon ] = useState(false)
  const [ isWatchingLocation, setWatchingLocation ] = useState(false)
  const [ distance, setDistance ] = useState(0)
  const [ tagMessages, setTagMessages ] = useState([])

  const cleanUpNfc = () => {
    NfcManager.setEventListener(NfcEvents.DiscoverTag, null)
    NfcManager.setEventListener(NfcEvents.SessionClosed, null)
  }

  const initNfc = async () => {
    await NfcManager.start()
  }

  const readNfc = async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    NfcManager.setEventListener(NfcEvents.DiscoverTag, async (tag: any) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mes = tag.ndefMessage.map((m: any) => Ndef.uri.decodePayload(m.payload))
      setTagMessages(mes)
      if (Platform.OS === 'ios') {
        await NfcManager.setAlertMessageIOS('NDEF tag found')
      }
      NfcManager.unregisterTagEvent().catch(() => 0)
    })
    NfcManager.setEventListener(NfcEvents.SessionClosed, () => {
      cleanUpNfc()
    })
    NfcManager.registerTagEvent()
  }

  const writeNfc = async () => {
    let result = false

    try {
      await NfcManager.requestTechnology(NfcTech.Ndef, {
        alertMessage: 'Ready to write some NDEF',
      })

      const bytes = Ndef.encodeMessage([
        Ndef.uriRecord('https://scatter-sample-kosuke.vercel.app'),
      ])

      if (bytes) {
        await NfcManager.ndefHandler
          .writeNdefMessage(bytes)

        if (Platform.OS === 'ios') {
          await NfcManager.setAlertMessageIOS('Successfully write NDEF')
        }
      }

      setTagMessages([])
      result = true
    }
    catch (e) {
      console.log(e)
    }

    NfcManager.cancelTechnologyRequest().catch(() => 0)
    return result
  }

  const cleanBeacon = () => {
    regions.forEach((region) => {
      Beacons.stopMonitoringForRegion(region)
      Beacons.stopRangingBeaconsInRegion(region)
    })
    Beacons.stopUpdatingLocation()
    DeviceEventEmitter.removeAllListeners()
    setWatchingBeacon(false)
  }

  const initBeacon = async () => {
    try {
      Beacons.getAuthorizationStatus((status: string) => {
        console.log('permission status', status)
        if (/authorizedWhenInUse|authorizedAlways/.test(status)) {
          return
        }
        // Beacons.requestWhenInUseAuthorization()
        Beacons.requestAlwaysAuthorization()
      })
    }
    catch (error) {
      return false
    }
  }

  const startBeacon = () => {
    regions.forEach((region) => {
      Beacons.startMonitoringForRegion(region)
      Beacons.startRangingBeaconsInRegion(region)
    })
    Beacons.startUpdatingLocation()

    setWatchingBeacon(true)
  
    Beacons.BeaconsEventEmitter.addListener(
      'authorizationStatusDidChange',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (data: any) => {
        console.log('authorizationStatusDidChange', data)
      },
    )
    Beacons.BeaconsEventEmitter.addListener(
      'beaconsDidRange',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (data: any) => {
        if (!!data && data.beacons.length > 0) {
          const newRegionData = [ ...regionDataRef.current ]
          const beacon = data.beacons[0]
          if (newRegionData.filter((d) => d.uuid === beacon.uuid).length <= 0) {
            regionDataRef.current = [ ...newRegionData, beacon ]
            setRegionData(regionDataRef.current)
            return
          }
          regionDataRef.current = newRegionData
            .map((region) => beacon.uuid === region.uuid ? beacon : region)
          setRegionData(regionDataRef.current)
        }
      },
    )
    Beacons.BeaconsEventEmitter.addListener(
      'didDetermineState',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (data: any) => {
        Alert.alert(data.state, data.identifier)
      },
    )
  }

  const cleanWatch = () => {
    Geolocation.clearWatch(watchId.current)
    setWatchingLocation(false)
  }

  const startWatch = () => {
    setWatchingLocation(true)
    watchId.current = Geolocation.watchPosition(
      (location) => {
        const { latitude, longitude } = location.coords
        const distance = getDistance(latitude, longitude, TARGET_LOCATION.lat, TARGET_LOCATION.lng)
        const isEnter = !!(RADIUS - distance)
        setDistance(distance)
        console.log(distance, 'enter: ', isEnter)
        if (isEnterRef.current === isEnter) {
          return
        }
        Alert.alert(isEnter ? 'Enter!!!' : 'Exit:)')
        Notifications.scheduleNotificationAsync({
          content: {
            title: isEnter ? 'Enter!!!' : 'Exit:)',
            body: `distance: ${distance}`,
          },
          trigger: null,
        })
        isEnterRef.current = isEnter
      },
      (error) => console.log(error),
      {
        distanceFilter: 0,
        maximumAge: 2000,
        enableHighAccuracy: false,
        useSignificantChanges: false,
      },
    )
  }

  const sendToWatch = async () => {
    const reachable = await getReachability()
    console.log(reachable ? 'Watch app is reachable' : 'Watch app is not reachable')
    if (!reachable) {
      sendToWatch()
    }

    if (reachable) {
      sendMessage({ message: 'Hello watch!' }, (reply) => {
        console.log(reply)
      })
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleMessageFromWatch = (message: any, reply: any) => {
    messagesRef.current = [ ...messagesRef.current, message.message ]
    setMessages(messagesRef.current)

    if (reply) {
      reply({ H3: 'Thanks watch!' })
    }
  }

  const initNotif = async () => {
    const hasNotifPermission = await checkNotificationPermission()
    console.log('hasNotifPermission: ', hasNotifPermission)

    if (!hasNotifPermission) {
      return
    }
  }

  useEffect(() => {
    initNfc()
    initBeacon()
    initNotif()
    const unsubscribe = watchEvents.on('message', handleMessageFromWatch)

    return () => {
      unsubscribe()
      cleanUpNfc()
      cleanBeacon()
    }
  }, [])

  return (
    <SafeAreaProvider>
      <View style={{ backgroundColor: '#fff', flex: 1 }}>
        <StatusBar />
        <ScrollView style={globalStyles.flex1}>
          <SafeAreaView>
            <View
              style={[
                globalStyles.flex1,
                globalStyles.alignCenter,
                globalStyles.justifyCenter,
              ]}
            >
              <View>
                <Spacer height="3rem" />
                <H1>React Native with watch app</H1>
                <Spacer height="2rem" />

                {/*  nfc test */}
                <H2 style={styles.titleTxt}>NFC</H2>
                <Spacer height="1rem" />
                <TouchableOpacity
                  onPress={readNfc}
                  style={[ styles.btn, globalStyles.alignCenter, globalStyles.justifyCenter ]}
                >
                  <H3 style={styles.btnTxt}>Read NFC</H3>
                </TouchableOpacity>
                <Spacer height="1rem" />
                <TouchableOpacity
                  onPress={writeNfc}
                  style={[ styles.btn, globalStyles.alignCenter, globalStyles.justifyCenter ]}
                >
                  <H3 style={styles.btnTxt}>Write NFC</H3>
                </TouchableOpacity>
                <Spacer height="1rem" />
                <H4>Tag messages</H4>
                <Spacer height=".5rem" />
                <View style={styles.response}>
                  {
                    tagMessages.map((m, i) => (
                      <View key={`tag-message-${i}`}>
                        <Spacer height=".25rem" />
                        <H3>{m}</H3>
                        <Spacer height=".25rem" />
                      </View>
                    ))
                  }
                </View>
                <Spacer height="3rem" />

                {/* beacon test */}
                <H2 style={styles.titleTxt}>Beacon</H2>
                <Spacer height="1rem" />
                <TouchableOpacity
                  onPress={isWatchingBeacon ? cleanBeacon : startBeacon}
                  style={[ styles.btn, globalStyles.alignCenter, globalStyles.justifyCenter ]}
                >
                  <H3 style={styles.btnTxt}>
                    {
                      isWatchingBeacon ? 'Stop Beacon' : 'Start Beacon'
                    }
                  </H3>
                </TouchableOpacity>
                {
                  regionData.length > 0 && regionData.map((region: any) => (
                    <View key={region.uuid}>
                      <Spacer height="1rem" />
                      <H4>{region.uuid}</H4>
                      <Spacer height=".5rem" />
                      <View style={styles.response}>
                        <H3>distance: {region.distance}</H3>
                      </View>
                      <Spacer height=".5rem" />
                      <View style={styles.response}>
                        <H3>proximity: {region.proximity}</H3>
                      </View>
                    </View>
                  ))
                }
                <Spacer height="3rem" />

                {/* geofence test */}
                <H2 style={styles.titleTxt}>Geofencing</H2>
                <Spacer height="1rem" />
                <TouchableOpacity
                  onPress={isWatchingLocation ? cleanWatch : startWatch}
                  style={[ styles.btn, globalStyles.alignCenter, globalStyles.justifyCenter ]}
                >
                  <H3 style={styles.btnTxt}>
                    {
                      isWatchingLocation ? 'Stop Geofence' : 'Start Geofence'
                    }
                  </H3>
                </TouchableOpacity>
                <Spacer height="1rem" />
                <H4>Distance</H4>
                <Spacer height=".5rem" />
                <View style={styles.response}>
                  <H3>distance: {distance}m</H3>
                </View>
                <Spacer height="3rem" />

                {/* messaging with watch app test */}
                <H2 style={styles.titleTxt}>With Watch App</H2>
                <Spacer height="1rem" />
                <TouchableOpacity
                  onPress={sendToWatch}
                  style={[ styles.btn, globalStyles.alignCenter, globalStyles.justifyCenter ]}
                >
                  <H3 style={styles.btnTxt}>Send Message to Watch</H3>
                </TouchableOpacity>
                <Spacer height="1rem" />
                <H4>Message from Watch App</H4>
                <Spacer height=".5rem" />
                <View style={styles.response}>
                  {
                    messages.map((mes, i) => (
                      <View key={i}>
                        <Spacer height=".25rem" />
                        <H3>{mes}</H3>
                        <Spacer height=".25rem" />
                      </View>
                    ))
                  }
                </View>
              </View>
            </View>
          </SafeAreaView>
        </ScrollView>
      </View>
    </SafeAreaProvider>
  )
}

export default App
