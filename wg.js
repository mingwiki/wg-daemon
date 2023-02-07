const child = require('child_process')
const dns = require('dns')
const { timer, tunnelName, domain } = require('./config')

const options = {
  family: 4,
}
const serviceName = `WireGuardTunnel$${tunnelName}`
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
      console.log('service starting...')
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
      console.log('service stopping...')
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
        console.log('current ip: ' + ip)
        console.log('old ip: ' + defaultIP)
        service
          .stop()
          .then(() => {
            service
              .start()
              .then(() => {
                console.log('service restarted')
                defaultIP = ip
                timerId = setInterval(() => {
                  app()
                }, timer)
              })
              .catch((error) => {
                clearInterval(timerId)
                console.log('start error: ' + error)
              })
          })
          .catch((error) => {
            console.log('stop error: ' + error)
          })
      }
    })
    .catch((error) => {
      console.log('dns error: ' + error)
    })
}
app()
