const child = require('child_process')
const dns = require('dns')
const { timer, tunnelName, domain } = require('./config')

const options = {
  family: 4,
}
const serviceName = `WireGuardTunnel$${tunnelName}`
let defaultIP = '127.0.0.1'
const service = {
  checkDns: () => {
    return new Promise((resolve, reject) => {
      console.log('\n')
      console.log(new Date().toLocaleString())
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
              .then(() => console.log('service restarted'))
              .catch((error) => {
                console.log('start error: ' + error)
              })
            defaultIP = ip
          })
          .catch((error) => {
            console.log('stop error: ' + error)
            service.start()
          })
      } else {
        console.log('Same IP: ' + ip)
      }
    })
    .catch((error) => {
      console.log('dns error: ' + error)
    })
}
setInterval(() => {
  app()
}, timer)
