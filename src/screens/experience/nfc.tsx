import React, { useEffect, useState } from 'react'
import {
  View,
  TouchableOpacity,
  Platform,
} from 'react-native'
import NfcManager, { NfcEvents, NfcTech, Ndef } from 'react-native-nfc-manager'

import Spacer from '../../components/spacer'
import { H2, H3, H4 } from '../../components/text'

import globalStyles from '../../utils/style'
import styles from './experience.style'

const Nfc = () => {
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

  useEffect(() => {
    initNfc()

    return () => {
      cleanUpNfc()
    }
  }, [])

  return (
    <View>
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
    </View>
  )
}

export default Nfc
