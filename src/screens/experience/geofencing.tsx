import React, { useEffect, useState, useRef } from 'react'
import {
  View,
  TouchableOpacity,
  Alert,
} from 'react-native'
import Geolocation from '@react-native-community/geolocation'

import Notifications from '../../utils/notification'

import Spacer from '../../components/spacer'
import { H2, H3, H4 } from '../../components/text'

import globalStyles from '../../utils/style'
import styles from './experience.style'

const TARGET_LOCATION = {
  lat: 35.66299429811237,
  lng: 139.6686254578199,
}
const RADIUS = 100
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

const Geofencing = () => {
  const watchId = useRef<number>(0)
  const isEnterRef = useRef(false)

  const [ isWatchingLocation, setWatchingLocation ] = useState(false)
  const [ distance, setDistance ] = useState(0)

  const cleanWatch = () => {
    setWatchingLocation(false)
    if (!watchId.current) {
      return
    }
    Geolocation.clearWatch(watchId.current)
  }

  const startWatch = () => {
    setWatchingLocation(true)
    watchId.current = Geolocation.watchPosition(
      (location) => {
        const { latitude, longitude } = location.coords
        const distance = getDistance(latitude, longitude, TARGET_LOCATION.lat, TARGET_LOCATION.lng)
        const isEnter = (RADIUS - distance) > 0
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

  useEffect(() => {
    return () => {
      cleanWatch()
    }
  }, [])

  return (
    <View>
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
    </View>
  )
}

export default Geofencing
