import React from 'react'
import { View } from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'

type Props = {
  height?: string,
  width?: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  style?: any,
}

const Spacer = ({ style, height, width }: Props) => {
  const styles = EStyleSheet.create({
    space: {
      height,
      width,
      ...style,
    },
  })

  return (
    <View style={styles.space} />
  )
}

Spacer.defaultProps = {
  height: '100%',
  width: '100%',
  style: {},
}

export default Spacer
