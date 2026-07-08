import app from './app';
import { env } from './config/env.js';

const server = app.listen(env.PORT);

//IIFE 
;( () => {
    try {
        //Database connection

        console.info(`App_got_Started`, {
            meta: {
                PORT: env.PORT,
                SERVER_URL: env.SERVER_URL
            }
        })
    } catch (err) {
        console.error(`App_get_error`,{meta:err})
        server.close((error) => {
            if(error) {
                console.error(`App_get_error`,{meta:error})
            }
            process.exit(1)
        })
    }
})()

