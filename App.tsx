import React, { useEffect, useState, useRef } from 'react'
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  View,
  TouchableOpacity,
} from 'react-native'
import {
  sendMessage,
  watchEvents,
  getReachability,
} from 'react-native-watch-connectivity'
import NfcManager, { NfcEvents } from 'react-native-nfc-manager'
import NoTypeBeacons from 'react-native-beacons-manager'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Beacons: any = NoTypeBeacons

const region = {
  identifier: 'ibeacon-test',
  uuid: '9c8a7cea-b59d-4f74-843a-0f84a567b131',
}

const App = () => {
  const [ messages, setMessages ] = useState([])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const messagesRef = useRef<any>([])

  const [ distance, setDistance ] = useState(0)

  const tagFound = useRef(null)

  const cleanUpNfc = () => {
    NfcManager.setEventListener(NfcEvents.DiscoverTag, null)
    NfcManager.setEventListener(NfcEvents.SessionClosed, null)
  }

  const initNfc = async () => {
    await NfcManager.start()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    NfcManager.setEventListener(NfcEvents.DiscoverTag, (tag: any) => {
      console.log(tag)
      tagFound.current = tag
      NfcManager.setAlertMessageIOS('NDEF tag found')
      NfcManager.unregisterTagEvent().catch(() => 0)
    })

    NfcManager.setEventListener(NfcEvents.SessionClosed, () => {
      cleanUpNfc()
    })
  }

  const readNfc = async () => {
    NfcManager.registerTagEvent()
  }

  const cleanBeacon = () => {
    Beacons.stopMonitoringForRegion(region)
    Beacons.stopRangingBeaconsInRegion(region)
  }

  const initBeacon = async () => {
    Beacons.requestWhenInUseAuthorization()
  }

  const startBeacon = () => {
    Beacons.startMonitoringForRegion(region)
    Beacons.startRangingBeaconsInRegion(region)
    Beacons.startUpdatingLocation()


    Beacons.BeaconsEventEmitter.addListener(
      'didDetermineState',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (data: any) => {
        console.log('didDetermineState', data)
      },
    )
    Beacons.BeaconsEventEmitter.addListener(
      'beaconsDidRange',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (data: any) => {
        if (!!data && data.beacons.length > 0) {
          setDistance(data.beacons[0].distance)
        }
      },
    )
  }

  const send = async () => {
    const reachable = await getReachability()
    console.log(reachable ? 'Watch app is reachable' : 'Watch app is not reachable')
    if (!reachable) {
      send()
    }

    if (reachable) {
      sendMessage({ message: 'Hello watch!' }, (reply) => {
        console.log(reply)
      })
    }
  }

  useEffect(() => {
    initNfc()
    initBeacon()
    const unsubscribe = watchEvents.on('message', (message, reply) => {
      console.log('received message from watch', message)
      messagesRef.current = [ ...messagesRef.current, message.message ]
      setMessages(messagesRef.current)

      if (reply) {
        reply({ text: 'Thanks watch!' })
      }
    })

    return () => {
      unsubscribe()
      cleanUpNfc()
      cleanBeacon()
    }
  }, [])

  return (
    <View style={{ backgroundColor: '#fff', flex: 1 }}>
      <SafeAreaView />
      <StatusBar />
      <ScrollView>
        <Text>React Native with watch app</Text>
        <TouchableOpacity
          onPress={readNfc}
          style={{
            backgroundColor: '#f00',
            padding: 20,
            margin: 20,
          }}
        >
          <Text>Read NFC</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={startBeacon}
          style={{
            backgroundColor: '#f00',
            padding: 20,
            margin: 20,
          }}
        >
          <Text>Start Beacon</Text>
        </TouchableOpacity>
        <View
          style={{
            backgroundColor: '#eee',
            padding: 10,
            marginHorizontal: 80,
          }}
        >
          <Text>distance: {distance}</Text>
        </View>
        <TouchableOpacity
          onPress={send}
          style={{
            backgroundColor: '#f00',
            padding: 20,
            margin: 20,
          }}
        >
          <Text>Send</Text>
        </TouchableOpacity>
        {
          messages.map((mes, i) => (
            <View key={i}>
              <Text>{mes}</Text>
            </View>
          ))
        }
      </ScrollView>
    </View>
  )
}

export default App
