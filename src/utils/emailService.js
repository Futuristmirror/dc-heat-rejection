import emailjs from '@emailjs/browser'

// EmailJS configuration - set these env vars in Railway
const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

export async function sendLeadNotification(userInfo, inputs, results) {
  if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
    console.log('EmailJS not configured - skipping email notification')
    return
  }

  const coolingLabel = {
    'air-cooled': 'Air-Cooled',
    'chilled-water': 'Chilled Water',
    'evaporative': 'Evaporative',
    'hybrid': 'Hybrid',
  }[inputs.coolingApproach] || inputs.coolingApproach

  try {
    await emailjs.send(SERVICE_ID, TEMPLATE_ID, {
      to_email: 'caseym@franceng.com',
      user_email: userInfo.email,
      user_company: userInfo.company || 'Not provided',
      project_name: userInfo.projectName || 'Not provided',
      it_load: inputs.itLoad + ' MW',
      pue: inputs.pue,
      cooling_approach: coolingLabel,
      heat_rejection: results.heatRejectionLoad + ' MW',
      cooling_capacity: results.coolingCapacityTons.toLocaleString() + ' tons',
      timestamp: new Date().toLocaleString(),
    }, PUBLIC_KEY)
  } catch (err) {
    console.error('Email notification failed:', err)
    // Don't throw - PDF download should still work even if email fails
  }
}
