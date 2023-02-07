const child = require('child_process')
const dns = require('dns')
const { timer, tunnelName, domain } = require('./config')

const options = {
  family: 4,
}
const serviceName = `WireGuardTunnel$${tunnelName}`
const log = (val) => {
  console.log(new Date().toLocaleString() + '\n' + val)
}
const service = {
  checkDns: () => {
    return new Promise((resolve, reject) => {
      dns.lookup(domain, options, (err, addresses) => {
        if (err) {
          reject(err)
        }
        resolve(addresses)
      })
    })
  },
  start: () => {
    return new Promise((resolve, reject) => {
      log('service starting...')
      child.exec(`net start ${serviceName}`, function (error, stdout, stderr) {
        if (error !== null) {
          reject(error)
        } else {
          resolve(true)
        }
      })
    })
  },
  stop: () => {
    return new Promise((resolve, reject) => {
      log('service stopping...')
      child.exec(`net stop ${serviceName}`, function (error, stdout, stderr) {
        if (error !== null) {
          reject(error)
        } else {
          resolve(true)
        }
      })
    })
  },
}
let defaultIP = '127.0.0.1'
let timerId
const app = () => {
  service
    .checkDns()
    .then((ip) => {
      if (ip !== defaultIP) {
        log('current ip: ' + ip)
        log('old ip: ' + defaultIP)
        service
          .stop()
          .then(() => {
            service
              .start()
              .then(() => {
                log('service restarted')
                defaultIP = ip
                timerId = setInterval(() => {
                  app()
                }, timer)
              })
              .catch((error) => {
                clearInterval(timerId)
                log('start error: ' + error)
              })
          })
          .catch((error) => {
            log('stop error: ' + error)
          })
      }
    })
    .catch((error) => {
      log('dns error: ' + error)
    })
}
app()
