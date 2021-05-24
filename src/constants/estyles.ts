import EStyleSheet from 'react-native-extended-stylesheet'
import { Platform } from 'react-native'

EStyleSheet.build({
  $black: '#000',
  $white: '#fff',

  $rem: Platform.OS === 'android' ? 12.5 : 16,
})
