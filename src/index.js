const { exec } = require('child_process')
const bodyParser = require('body-parser')
const express = require('express')
const util = require('util')

const execAsync = util.promisify(exec)

const app = express()

app.use(bodyParser.json())

app.post('/docker', async (req, res) => {
  try {
    if (req.body?.ref?.includes('master') === false) return res.send('Ignorando o build. O deploy só é feito na branch master.')

    const cwd = `/etc/server-web/app/${req.params.repo}`

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

app.listen(3000, () => {
  console.log(`Servidor de deploy ouvindo na porta ${3000}.`)
})
