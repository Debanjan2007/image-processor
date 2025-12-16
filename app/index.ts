import app from './app.js'
import { connectDB , AppError } from 'devdad-express-utils'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
export const __dirname = path.dirname(__filename)
// load the .env file located in src/
dotenv.config({ path: path.join(__dirname, '.env') })

const port = 5600;

connectDB().then(() => {
    app.listen(port, () => {
        console.log(`Server is running at http://localhost:${port}`);
    })
})
.catch((error) => {
    throw new AppError("Something went wrong while running it" , 500 , error)
})

