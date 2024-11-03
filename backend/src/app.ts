import express, { Application } from 'express'
import cors from 'cors'
import routes from './routes'

const app:Application = express()
const port = 3000

app.use(cors())
app.use(express.json())

app.use('/app', routes)

app.listen(port, () => {
    console.log(`App is listening at http://localhost:${port}`)
})