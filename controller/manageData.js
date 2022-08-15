import { postData, getDBData } from '../connector.js'
import {encrypt, decrypt} from '../encrypt_decrypt.js';

export const sendData = (req, res)=>{
    let reqData = req.query.data_query;
   
    while(reqData.includes("t36i") || reqData.includes("8h3nk1") || reqData.includes("d3ink2")){
        reqData = reqData.replace("t36i", "+").replace("8h3nk1", "/").replace("d3ink2", "=");
    }
    reqData = decrypt(reqData);
    console.log(reqData);
    if(reqData != ""){
        try{
            getDBData(reqData,function(rows){
                let encryptedString = getEncryptedData(rows);
                res.status(200).send(encryptedString);
            });
        }
        catch(err){
            console.log(err);
        }
    }
}

export const getData = (req, res)=>{
    let encryptedString = req.params.data;
    let jsonData = JSON.parse(decrypt(encryptedString));
    if(jsonData.taskName){
        let dateStr = jsonData.taskDate;
        let startTime = timeformat(jsonData.startTime);
        let endTime = timeformat(jsonData.endTime);
        
        let command = `insert into current_tasks (taskName, taskDescription, taskDate, taskStartTime, taskEndTime, taskIsDone, isPermanent, isWeekly) 
        values ("${jsonData.taskName}", "${jsonData.taskDescription}", '${dateStr}', '${startTime}:00:00', '${endTime}:00:00', false, ${jsonData.isPermanent}, ${jsonData.isWeekly})`;
        console.log(command);

        postData(command, (response)=>{
            res.send("Task added");
        });
    }
    else if (jsonData.appName){
        let command = `insert into locked_apps (appPackageName, appLockedDate) values("${jsonData.appName}", '${jsonData.appDate}')`;
        postData(command, (response)=>{
            res.send("App added");
        });
    }
}

export const deleteData = (req, res)=>{
    let data = req.params.data;
    if(isNumeric(data)){
        let command = `delete from current_tasks where taskID = ${data}`;
        console.log(command);
        postData(command, (response)=>{
            res.send("Task deleted")
        })
    }
    else{
        let command = `delete from locked_apps where appPackageName = '${data}'`
        console.log(command);
        postData(command, (response)=>{
            res.send("Locked app detele");
        });
    }
}

function isNumeric(str) {
    if (typeof str != "string") return false // we only process strings!  
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
           !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
  }

export const taskDone = (req, res)=>{
    let id = parseInt(req.params.id)
    let command = `update current_tasks set taskIsDone = true where taskID = ${id}`;
    postData(command, (response)=>{
        res.send("updated")
    });
}

function timeformat(data){
    if(data.length == 2){
        return data;
    }
    else{
        return `0${data}`
    }
}




function getEncryptedData(rows){
    let encryptedString = encrypt(JSON.stringify(rows));
    while(encryptedString.includes("+") || encryptedString.includes("/") || encryptedString.includes("=")){
        encryptedString = encryptedString.replace("+", "t36i").replace("/", "8h3nk1").replace("=", "d3ink2");
    }
    return encryptedString;
}



