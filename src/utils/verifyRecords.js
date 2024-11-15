import { promises } from 'dns'

export async function verifyRecords(domain) {
  let score = 0
  // 6. Check domain status, score: 20
  async function checkDomainStatus(domain) {
    try {
      const aRecords = await promises.resolve(domain, 'A').catch(() => null)
      const nsRecords = await promises.resolveNs(domain).catch(() => null)
      if (!nsRecords) return 'inactive'
      return isParked(nsRecords, aRecords) ? 'parked' : 'active'
    } catch (error) {
      console.error('Error checking domain status:', error)
      return 'unknown'
    }
  }

  function isParked(nsRecords, aRecords) {
    const knownParkingNameservers = [
      'parked.com',
      'sedoparking.com',
      'bodis.com',
      'parkingcrew.net',
      'parklogic.com',
      'namejet.com',
    ]
    return (
      nsRecords.some((ns) =>
        knownParkingNameservers.some((parking) => ns.includes(parking))
      ) ||
      (aRecords &&
        aRecords.length === 1 &&
        ['0.0.0.0', '127.0.0.1', '192.168.0.1'].includes(aRecords[0]))
    )
  }

  const domain_status = await checkDomainStatus(domain)
  if (domain_status === 'active') {
    score += 20
  } else if (domain_status === 'parked' || domain_status === 'inactive') {
    score -= 20
  }

  // 7. Check MX records, score: 30
  async function resolveMXRecords() {
    try {
      // Attempt to resolve MX records using the DNS promises API
      const mxRecords = await promises.resolveMx(domain)
      const validMxRecords = mxRecords
        ?.filter((record) => record.exchange && record.priority > 0)
        .sort((a, b) => a.priority - b.priority)

      return validMxRecords?.length > 0 ? validMxRecords[0].exchange : null
    } catch (error) {
      console.error('Error resolving MX records with DNS promises:', error)

      // Retry with dns.google.com/resolve as a fallback
      try {
        const response = await fetch(
          `https://dns.google/resolve?name=${domain}&type=MX`
        )
        const data = await response.json()

        if (data.Status === 0 && data.Answer) {
          const mxRecords = data.Answer.filter(
            (answer) => answer.type === 15 // Type 15 indicates MX records
          ).sort((a, b) => {
            // Extract priority from the data field
            const priorityA = parseInt(a.data.split(' ')[0], 10)
            const priorityB = parseInt(b.data.split(' ')[0], 10)
            return priorityA - priorityB
          })

          return mxRecords.length > 0
            ? mxRecords[0].data.split(' ')[1] // Return the mail server address
            : null
        }

        console.warn('No valid MX records found using dns.google.com')
        return null
      } catch (googleError) {
        console.error(
          'Error resolving MX records with Google DNS API:',
          googleError
        )
        return null
      }
    }
  }

  const mx_record = await resolveMXRecords()
  if (mx_record) {
    score += 30
  } else {
    score -= 30
  }

  return {
    score,
    domain_status: domain_status,
    mx_record: mx_record,
  }
}
