import React from 'react'
import { Text } from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'

type Props = {
  children: React.ReactNode,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  style?: any,
  color?: string,
  numberOfLines?: number
}

const TextComponent = ({ children, color, style, ...props }: Props) => {
  const styles = EStyleSheet.create({
    text: {
      ...style,
    },
  })

  return (
    <Text style={styles.text} {...props}>
      {children}
    </Text>
  )
}

TextComponent.defaultProps = {
  style: null,
}

export const P = ({ style, ...props }: Props) => (
  <TextComponent
    {...{
      style: {
        fontSize: '.875rem',
        fontWeight: '400',
        color: '$grayDark',
        lineHeight: '1.375rem',
        ...style,
      },
      ...props,
    }}
  />
)

export const H1 = ({ style, ...props }: Props) => (
  <TextComponent
    {...{
      style: {
        fontSize: '3rem',
        fontWeight: '700',
        color: '$black',
        lineHeight: '3.25rem',
        ...style,
      },
      ...props,
    }}
  />
)

export const H2 = ({ style, ...props }: Props) => (
  <TextComponent
    {...{
      style: {
        fontSize: '2rem',
        fontWeight: '700',
        color: '$black',
        lineHeight: '2.25rem',
        ...style,
      },
      ...props,
    }}
  />
)

export const H3 = ({ style, ...props }: Props) => (
  <TextComponent
    {...{
      style: {
        fontSize: '1.125rem',
        fontWeight: '700',
        color: '$black',
        lineHeight: '1.4375rem',
        ...style,
      },
      ...props,
    }}
  />
)

export const H4 = ({ style, ...props }: Props) => (
  <TextComponent
    {...{
      style: {
        fontSize: '.875rem',
        fontWeight: '700',
        color: '$black',
        lineHeight: '1.0625rem',
        ...style,
      },
      ...props,
    }}
  />
)

export const H5 = ({ style, ...props }: Props) => (
  <TextComponent
    {...{
      style: {
        fontSize: '1rem',
        fontWeight: '700',
        color: '$gray',
        lineHeight: '1.1875rem',
        ...style,
      },
      ...props,
    }}
  />
)

export const Span = ({ style, ...props }: Props) => (
  <TextComponent
    {...{
      style: {
        fontSize: '.75rem',
        fontWeight: '500',
        color: '$gray',
        lineHeight: '.9375rem',
        ...style,
      },
      ...props,
    }}
  />
)
