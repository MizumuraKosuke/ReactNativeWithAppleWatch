import React, { useEffect, useState, useRef } from 'react'
import {
  View,
  TouchableOpacity,
} from 'react-native'
import {
  sendMessage,
  watchEvents,
  getReachability,
} from 'react-native-watch-connectivity'

import Spacer from '../../components/spacer'
import { H2, H3, H4 } from '../../components/text'

import globalStyles from '../../utils/style'
import styles from './experience.style'

const WithWatch = () => {
  const [ messages, setMessages ] = useState([])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const messagesRef = useRef<any>([])

  const sendToWatch = async () => {
    const reachable = await getReachability()
    console.log(reachable ? 'Watch app is reachable' : 'Watch app is not reachable')
    if (!reachable) {
      sendToWatch()
      return
    }

    sendMessage({ message: 'Hello watch!' }, (reply) => {
      console.log(reply)
    })
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
    const unsubscribe = watchEvents.on('message', handleMessageFromWatch)

    return () => {
      unsubscribe()
    }
  }, [])

  return (
    <View>
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
  )
}

export default WithWatch
