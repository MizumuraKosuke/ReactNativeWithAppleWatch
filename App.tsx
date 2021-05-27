import React, { useEffect, useState, useRef } from 'react'
import {
  ScrollView,
  StatusBar,
  View,
  TouchableOpacity,
  Platform,
} from 'react-native'
import {
  sendMessage,
  watchEvents,
  getReachability,
} from 'react-native-watch-connectivity'
import NfcManager, { NfcEvents, NfcTech, Ndef } from 'react-native-nfc-manager'
import NoTypeBeacons from 'react-native-beacons-manager'
import EStyleSheet from 'react-native-extended-stylesheet'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'

import './src/constants/estyles'

import Spacer from './src/components/spacer'
import { H1, H2, H3, H4 } from './src/components/text'
import globalStyles from './src/utils/style'

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

  useEffect(() => {
    initNfc()
    initBeacon()
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
                <H2 style={styles.titleTxt}>Beacon</H2>
                <Spacer height="1rem" />
                <TouchableOpacity
                  onPress={startBeacon}
                  style={[ styles.btn, globalStyles.alignCenter, globalStyles.justifyCenter ]}
                >
                  <H3 style={styles.btnTxt}>Start Beacon</H3>
                </TouchableOpacity>
                <Spacer height="1rem" />
                <View style={styles.response}>
                  <H3>distance: {distance}</H3>
                </View>
                <Spacer height="3rem" />
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

export default App
