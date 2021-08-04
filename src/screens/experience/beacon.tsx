import React, { useEffect, useState, useRef } from 'react'
import {
  View,
  TouchableOpacity,
  DeviceEventEmitter,
  Alert,
} from 'react-native'
import NoTypeBeacons from 'react-native-beacons-manager'

import Notifications from '../../utils/notification'

import Spacer from '../../components/spacer'
import { H2, H3, H4 } from '../../components/text'

import globalStyles from '../../utils/style'
import styles from './experience.style'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Beacons: any = NoTypeBeacons

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

const Beacon = () => {
  const regionDataRef = useRef<any>([])

  const [ regionData, setRegionData ] = useState<any>(regionDataRef.current)
  const [ isWatchingBeacon, setWatchingBeacon ] = useState(false)
  const isEnter = useRef(false)

  const cleanBeacon = () => {
    regions.forEach((region) => {
      Beacons.stopMonitoringForRegion(region)
      Beacons.stopRangingBeaconsInRegion(region)
    })
    Beacons.stopUpdatingLocation()
    Beacons.allowsBackgroundLocationUpdates(false)
    DeviceEventEmitter.removeAllListeners()
    isEnter.current = false
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
    Beacons.allowsBackgroundLocationUpdates(true)

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
          if (beacon.distance >= 0 && beacon.distance <= 5) {
            if (!isEnter.current) {
              isEnter.current = true
              Alert.alert('near door', `${beacon.uuid} distance: ${beacon.distance}`)
              Notifications.scheduleNotificationAsync({
                content: {
                  title: 'near door',
                  body: `${beacon.uuid} distance: ${beacon.distance}`,
                },
                trigger: null,
              })
            }
          }
          if (beacon.distance > 5) {
            isEnter.current = false
          }
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
        if (data.state === 'outside') {
          Alert.alert('outside')
          isEnter.current = false
        }
        // Alert.alert(data.state, data.identifier)
      },
    )
  }

  useEffect(() => {
    initBeacon()

    return () => {
      cleanBeacon()
    }
  }, [])

  return (
    <View>
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
    </View>
  )
}

export default Beacon
