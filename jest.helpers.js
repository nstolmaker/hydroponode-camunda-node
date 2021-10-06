require('dotenv').config()
const axios = require('axios').default
const { Consts } = require('./util.js');

global.startNewProcess = async () => {
  let endpoint = `${Consts.engineConfig.baseUrl}/process-definition/key/${Consts.CAMUNDA_PROCESS_NAME}/start`
  let resp = await axios(endpoint, {
    method: 'POST',
    headers: { 'content-type': 'application/json'}
  });
  return { status: resp.status, data: resp.data }
}

global.fetchAndLock = async (topicName) => {
  // now fetch and lock one task waiting for sensor-data
  // console.log("FETCHING AND LOCKING")
  endpoint = `${Consts.engineConfig.baseUrl}/external-task/fetchAndLock`
  const lockResp = await axios(endpoint, {
    data: {
      "workerId": "jest",
      "maxTasks": 1,
      "usePriority": true,
      "topics": [
        {
          "topicName": topicName,
          "lockDuration": 10000,
          "variables": [
            "light",
            "moisture"
          ]
        }
      ]
    },
    method: 'POST',
    headers: { 'content-type': 'application/json'}
  });
  return { status: lockResp.status, data: lockResp.data[0] }
}

global.sendSensorData = async (sensorDataExternalTaskId, sensorData) => {
  if (sensorDataExternalTaskId == undefined || !sensorDataExternalTaskId) { throw new Error("[global.sendSensorData] ERROR: sensorDataExternalTaskId is undefined"); return false; }
  // now send in the sensor data
  endpoint = `${Consts.engineConfig.baseUrl}/external-task/${sensorDataExternalTaskId}/complete`
  sendSensorDataResp = await axios(endpoint, {
    data: {
      "workerId": "jest",
      "variables": {
        "moisture": {
          "value": sensorData.moisture,
          "type": "Integer"
        },
        "light": {
          "value": sensorData.light,
          "type": "Integer"
        },
        "temperature": {
          "value": sensorData.temperature,
          "type": "Integer"
        },
        "battery": {
          "value": sensorData.battery,
          "type": "Integer"
        }
      },
      "localVariables": {
        "wasCreatedByTest": {
          "value": "true"
        }
      }
    },
    method: 'POST',
    headers: { 'content-type': 'application/json'}
  });
  return { status: sendSensorDataResp.status }
}
