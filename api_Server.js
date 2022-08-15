import express from 'express';
import bodyParser from 'body-parser';
import { sendData, getData, taskDone, deleteData } from './controller/manageData.js';
import { start } from './controller/controller.js';


const PORT = process.env.PORT || 2400;
const app = express();


app.use(bodyParser.json())

app.get("/data", sendData);

app.post("/getData/:data", getData);

app.patch("/done/:id", taskDone)

app.delete("/deleteData/:data", deleteData)


app.listen(PORT, ()=>{
    console.log(`The app is listening on ${PORT}`)
})

start()
