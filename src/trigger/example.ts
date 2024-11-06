import { logger, task } from '@trigger.dev/sdk/v3'
import { promises } from 'dns'
import disposable from 'disposable-email'
import mailcheck from 'mailcheck'
import { roleKeywords } from '../utils/roleKeywords'

export const helloWorldTask = task({
  id: 'hello-world',
  maxDuration: 300, // 5 minutes
  run: async (
    payload: {
      email: string
    },
    { ctx }
  ) => {
    const { email } = payload
    let score = 0
    const domain = email.split('@')[1]
    const [username] = email.split('@')

    // 1. Check syntax, score: 5
    const verifyEmailFormat = (val: string) => {
      const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i
      return regex.test(val)
    }

    const syntax = verifyEmailFormat(email)
    if (syntax) score += 5
    else
      return {
        score: 0,
        syntax,
        gibberish: null,
        typos: null,
        role: null,
        disposable: null,
        domain: null,
        domain_age: null,
        domain_reputation: null,
        did_you_mean: null,
      }

    // 2. Check if email is gibberish, score: 5
    function isGibberishEmail(val: string) {
      const hasExcessiveNumbers =
        (username.match(/\d/g) || []).length / username.length > 0.5
      const hasRandomPattern = /^[a-zA-Z0-9]{8,}$/.test(username)
      const isRandomSequence =
        /^[a-zA-Z0-9]+$/.test(username) && !/^[a-zA-Z]+$/.test(username)
      return (
        username.length > 8 &&
        (hasExcessiveNumbers || hasRandomPattern || isRandomSequence)
      )
    }

    const gibberish = isGibberishEmail(username)
    if (!gibberish) score += 5
    else score -= 5

    // 3. Check typos, score: 5
    let did_you_mean = null

    mailcheck.run({
      email: email,
      defaultTopLevelDomains: [domain],
      suggested: (suggestion: any) => {
        did_you_mean = suggestion.full
      },
      empty: () => null,
    })
    if (!did_you_mean) score += 5

    // 4. check if email is role based, score: 5
    function isRoleEmail(val: string) {
      // Check if the username contains any of the role keywords
      return roleKeywords.some((role) => username.toLowerCase().includes(role))
    }
    const roleBased = isRoleEmail(username)
    if (!roleBased) score += 5
    else score -= 5

    // 4. Check disposable, score: 15
    const disposableCheck = disposable.validate(email)
    if (disposableCheck) score += 15
    else score -= 15

    // 5. Check domain status, score: 20
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
        'domaincontrol.com',
        'parkingcrew.net',
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
    if (domain_status === 'active') score += 20
    else if (domain_status === 'parked' || domain_status === 'inactive')
      score -= 20

    // 6. Check MX records, score: 30
    const resolveMXRecords = async (email) => {
      const [, domain] = email.split('@')
      try {
        const mxRecords = await promises.resolveMx(domain)
        const validMxRecords = mxRecords
          ?.filter((record) => record.exchange && record.priority > 0)
          .sort((a, b) => a.priority - b.priority)
        return validMxRecords?.length > 0 ? validMxRecords[0].exchange : null
      } catch (error) {
        logger.error('Error resolving MX records:', error)
        return null
      }
    }

    const mx_record = await resolveMXRecords(email)
    if (mx_record) score += 30
    else score -= 30

    // Determine status based on score
    let status
    if (score >= 75) status = 'deliverable'
    else if (score >= 60) status = 'risky'
    else if (!mx_record) status = 'undeliverable'
    else status = 'unknown'

    // Return final object
    return {
      status,
      score: score < 0 ? 0 : score > 100 ? 100 : score,
      email,
      syntax,
      gibberish,
      role: roleBased,
      did_you_mean,
      disposable: !disposableCheck,
      domain_status,
      mx_record,
    }
  },
})
