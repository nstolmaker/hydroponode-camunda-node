require('dotenv').config()
const {Consts} = require('../util.js');
const axios = require('axios').default;


// import 'dotenv/config.js';

/* Tell Camunda about the new sensor data! */
class Broadcast {
  constructor() {
    this.workflowEngineAddress = Consts.CAMUNDA_BASE_URL
    this.databaseEndpoint = `https://${Consts.BIRDSNEST_DOMAIN}/`
    this.sensorData = {}
  }
  // THIS WAS RIPPED FROM THE OLD APP. MIGHT WANT IT SOME DAY.
  // async broadcastToWorkflowEngine(sensorData) {
  //   try {
  //     console.log("Broadcasting to workflow engine, sending sensorData: ", sensorData);
  //     const taskResponseArr = await this.fetchAndLockOneTask();
  //     console.log("taskUnit returned from server is below. look for an id and pass it into the completed function", taskResponseArr);

  //     // we only ask for one job at a time so the length should be 1. TODO: Throw an error if length > 0.
  //     if (taskResponseArr.length !== 1) {
  //       console.log("Error. taskResponseArr is too long or too short. it is: ", taskResponseArr);
  //       return false
  //     }

	//     const taskResponse = taskResponseArr.pop();
  //     const { id: taskId } = taskResponse;
  //     console.log("TaskId is: " + taskId);
  //     return await this.sendSensorData(taskId, sensorData)
  //   } catch (e) {
	//     console.log("Error in broadcastToWorkflowEngine: ", e)
  //     throw new Error("Something went wrong in the broadcastToWorkflowEngine function.")
  //     return false
  //   }
  // }
  /**
   * Before we can do anything to a task in camunda, we have to take ownership of it and give it a temporary lock.
   * 
   */
  // async fetchAndLockOneTask() {
  //   // payload
  //   const bodyPayload = {
  //     "workerId":"some-random-id",
  //     "maxTasks":1,
  //     "usePriority":true,
  //     "asyncResponseTimeout": 29000,
  //     "topics":[
  //        {
  //           "topicName":"sensor-data",
  //           "lockDuration":1000
  //        }
  //     ]
  //   }

  //   // request
  //   const response = await axios({
  //     url: `${this.workflowEngineAddress}/engine-rest/external-task/fetchAndLock`,
  //     data: bodyPayload,
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json'
  //     }  
  //   }).catch((reason)=>{
  //     console.log("AXIOS ERROR! Reason: ", reason)
  //   })

  //   // response
  //   if (response && response.status === 200) {
  //     console.log("Fetched and locked one in! Go ahead and send in the data now.")
	//     console.log("Response from fetchandlock was: ", response.data)
  //     return response.data
  //   } else {
  //     console.log("Fetched and locked but unrecognized status: ", response)
  //     return false
  //   }
  // }

  // /**
  //  * @param {moisture, light, temperature, battery_level} sensorData 
  //  * @description closes the workflow external task that's waiting, by sending it actual sensor data
  //  */
  // async sendSensorData(taskId, sensorData) {
  //   // payload
  //   const bodyPayload = {
  //     "workerId": "some-random-id",
  //     "variables": {
  //       "moisture": {
  //         "value": Math.round(sensorData.moisture),
  //         "type": "Integer"
  //       },
  //       "light": {
  //         "value": Math.round(sensorData.light),
  //         "type": "Integer"
  //       },
  //       "temperature": {
  //         "value": Math.round(sensorData.temperature),
  //         "type": "Integer"
  //       },
  //       "battery": {
  //         "value": Math.round(sensorData.battery),
  //         "type": "Integer"
  //       }
  //     },
  //   }

  //   const endpointPath = `${this.workflowEngineAddress}/engine-rest/external-task/${taskId}/complete`
	//   console.log("About to send sensor data to endpoint: ", endpointPath);
	//   console.log("Payload is: ", bodyPayload);
  //   const response = await axios({
  //     url: endpointPath,
  //     data: bodyPayload,
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json'
  //     }  
  //   }).catch((reason)=>{
  //     console.log("AXIOS ERROR! Reason: ", reason)
	//     console.log("Response data: ", response.data)
  //   })

  //   // response
  //   if (response.status === 204) {
  //     console.log("Sensor Data sent!")
  //     return true
  //   } else {
  //     console.log("Sensor Data sent but unrecognized status: ", response)
  //     return false
  //   }
  // }

  async recordSensorDataInDb(sensorData) {
    console.log("About to send sensor data to endpoint: ", this.databaseEndpoint + 'sensor-data');
    const bodyPayload = 
    {
      data: sensorData
    }
    
	  console.log("Payload is: ", bodyPayload);
    const response = await axios({
      url: this.databaseEndpoint + 'sensor-data',
      data: bodyPayload,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }  
    }).catch((reason)=>{
      console.log("AXIOS ERROR! Reason: ", reason)
	    // console.log("Response data: ", response.data)
    })

    // response
    if (response.status === 201) {
      console.log("Sensor Data sent!")
      return true
    } else {
      console.log("Sensor Data sent but unrecognized status: ", response)
      return false
    }
  }

  async recordActionHistoryInDb(actionData) {
    console.log("About to send action history data to endpoint: ", this.databaseEndpoint + 'action-history');
    const bodyPayload = JSON.stringify(actionData);
    
	  console.log("Payload is: ", bodyPayload);
    const response = await axios({
      url: this.databaseEndpoint + 'action-history',
      data: bodyPayload,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }  
    }).catch((reason)=>{
      console.log("AXIOS ERROR! Reason: ", reason)
	    // console.log("Response data: ", response.data)
    })

    // response
    if (response.status === 201) {
      console.log("action-history Data sent!")
      return true
    } else {
      console.log("action-history Data sent but unrecognized status: ", response)
      return false
    }
  }
}

module.exports = Broadcast