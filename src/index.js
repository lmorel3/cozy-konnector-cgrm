const { BaseKonnector, signin, log } = require('cozy-konnector-libs')

const moment = require('moment')

const baseUrl = 'https://www.cgrm.fr/'
const pdfUrl = 'https://www.cgrm.fr/adherents/mes-remboursements/voir-pdf?mois='

module.exports = new BaseKonnector(start)

async function start(fields) {
  log('info', 'Authenticating ...')

  await authenticate(fields.login, fields.password)
  log('info', 'Successfully logged in')

  const invoices = generateInvoices(
    moment().add(-2, 'years'),
    moment().add(-1, 'months')
  )

  log('info', 'Invoices', invoices)

  await this.saveFiles(invoices, fields)
}

/**
 * Login, via the login form
 **/
function authenticate(login, password) {
  return signin({
    url: baseUrl,
    formSelector: '#form_connexion',
    formData: { form_login: login, form_mdp: password },
    validate: (statusCode, $, fullResponse) => {
      log(
        'debug',
        fullResponse.request.uri.href,
        'not used here but should be useful for other connectors'
      )

      if ($(`input#deconnexion`).length === 1) {
        return true
      } else {
        log('error', $('.error').text())
        return false
      }
    }
  })
}

/**
 * Generates a liste of invoices between those dates
 **/
function generateInvoices(dateStart, dateEnd) {
  const months = []

  while (dateEnd.diff(dateStart, 'months') >= 0) {
    months.push(dateStart.format('01/MM/YYYY'))
    dateStart.add(1, 'month')
  }

  return months.map(month => {
    return {
      fileurl: `${pdfUrl}${month}`,
      filename: month.replace(/\//g, '-') + '.pdf'
    }
  })
}
