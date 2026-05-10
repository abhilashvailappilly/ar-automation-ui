import type { EmailThreadMessage } from '../types/emailThread'

/** Shown when GET /email/thread/:arId succeeds but returns no messages. */
export const PLACEHOLDER_EMAIL_BODY = `Dear  Customer,

I hope this message finds you well. I am writing to follow up on the outstanding invoice XXXX, which is due on XXXX-XX-XX.

Please let us know if you have any questions or require further information regarding this invoice.

Thank you for your attention to this matter.
`

export function buildPlaceholderEmailMessages(labels: {
  from: string
  subject: string
}): EmailThreadMessage[] {
  return [
    {
      direction: 'OUTBOUND',
      from: labels.from,
      subject: labels.subject,
      body: PLACEHOLDER_EMAIL_BODY,
      timestamp: new Date().toISOString(),
    },
  ]
}
