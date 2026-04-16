import { DEFAULT_USER_ID } from './prisma'

export type NotificationKind =
  | 'booking_confirmed'
  | 'booking_cancelled'
  | 'booking_rescheduled'

export type NotificationInput = {
  bookingId: string
  recipient: string
  subject: string
  type: NotificationKind
  payload: Record<string, unknown>
}

type MockNotificationLog = NotificationInput & {
  id: string
  createdAt: string
  status: 'logged' | 'failed'
}

export async function logNotification(
  prisma: any,
  input: NotificationInput
) {
  const line = `[notification:${input.type}] to=${input.recipient} subject="${input.subject}" booking=${input.bookingId}`
  console.log(line, input.payload)

  if (!prisma) {
    const g = globalThis as unknown as {
      __aj_cal_mockNotifications?: MockNotificationLog[]
    }
    if (!g.__aj_cal_mockNotifications) {
      g.__aj_cal_mockNotifications = []
    }
    g.__aj_cal_mockNotifications.push({
      id: `notif_${Date.now()}_${Math.random().toString(16).slice(2)}`,
      createdAt: new Date().toISOString(),
      status: 'logged',
      ...input,
    })
    return
  }

  await prisma.notificationLog.create({
    data: {
      bookingId: input.bookingId,
      recipient: input.recipient,
      subject: input.subject,
      type: input.type,
      payloadJson: JSON.stringify({
        ...input.payload,
        userId: DEFAULT_USER_ID,
      }),
      status: 'logged',
    },
  })
}
