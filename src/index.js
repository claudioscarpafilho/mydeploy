const { exec } = require('child_process')
const express = require('express')
const https = require('https')
const util = require('util')
const fs = require('fs')

const execAsync = util.promisify(exec)

const app = express()

const httpsOptions = {
  key: fs.readFileSync('/etc/server-web/ssl/dominio.com.br.key'),
  cert: fs.readFileSync('/etc/server-web/ssl/dominio.com.br.crt'),
}

app.use(express.json())

app.post('/docker', async (req, res) => {
  try {
    if (req.body?.ref?.includes('master') !== true) return res.send('Ignorando o build. O deploy só é feito na branch master.')

    const cwd = `/etc/server-web/app/${req.body.repository.name}`

    console.log('git reset:')
    console.log(await execAsync('git reset --hard', { cwd }))

    console.log('git pull:')
    console.log(await execAsync('git pull', { cwd }))

    console.log('docker-compose up --build -d:')
    console.log(await execAsync('docker-compose up --build -d', { cwd }))

    return res.send('Deploy realizado com sucesso.')
  } catch (error) {
    console.log(error)
    return res.send(error.message)
  }
})

https.createServer(httpsOptions, app).listen(4400, () => {
  console.log('Server running on https://dominio.com.br:4400')
})
