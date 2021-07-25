import * as Notifications from 'expo-notifications'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
})

export const checkNotificationPermission: () => Promise<boolean> = async () => {
  try {
    const settings = await Notifications.getPermissionsAsync()
    let finalStatus = settings.granted

    if (!finalStatus) {
      const request = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
        },
      })
      finalStatus = request.granted
    }

    if (!finalStatus) {
      return false
    }
  }
  catch (error) {
    return false
  }

  return true
}

export default Notifications
