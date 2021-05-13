import React, { useEffect, useState, useRef } from 'react'
import type { Node } from 'react'
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

const App: () => Node = () => {
  const [ messages, setMessages ] = useState([])
  const messagesRef = useRef<any>([])

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
    }
  }, [])

  return (
    <View style={{ backgroundColor: '#fff', flex: 1 }}>
      <SafeAreaView />
      <StatusBar />
      <ScrollView>
        <Text>React Native with watch app</Text>
        <TouchableOpacity
          onPress={send}
          style={{
            backgroundColor: '#f00',
            padding: 10,
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
