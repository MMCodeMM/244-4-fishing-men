import express from 'express'
import { print } from 'listening-on'

let app = express()

app.use('/dist/client', express.static('dist/client'))
app.use(express.static('public'))

app.get('/', (req, res) => {
  res.write('Welcome')
  res.end()
})

let port = 3000

app.listen(port, () => {
  print(port)
})

