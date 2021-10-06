require('dotenv').config()
const axios = require('axios').default
const { Client, logger } = require('camunda-external-task-client-js');
const { Consts } = require('../util.js');
const { SwitchIpFromName, setSwitchStatus, getSwitchStatus } = require('../util.js');
const WorkflowSubscriptions = require('../services/WorkflowSubscriptions.js');

let client;
let workflow;
beforeEach(() => {
  // we will need a running worker to make the tests work I think.
  console.log("[${new Date().toLocaleString()}] WORKER STARTING. Using Camunda Engine @ "+Consts.engineConfig.baseUrl)
  client = new Client(Consts.engineConfig);
  workflow = new WorkflowSubscriptions(client)
})


afterEach(() => {
  client.stop();
});

const startNewProcess = async () => {
  let endpoint = `${Consts.engineConfig.baseUrl}/process-definition/key/${Consts.CAMUNDA_PROCESS_NAME}/start`
  let resp = await axios(endpoint, {
    method: 'POST',
    headers: { 'content-type': 'application/json'}
  });
  return { status: resp.status, data: resp.data }
}

const fetchAndLock = async (topicName) => {
  // now fetch and lock one task waiting for sensor-data
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

const sendSensorData = async (sensorDataExternalTaskId, sensorData) => {
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



test('Garden Path - no changes required', async () => {
  // first, define some sensor data
  const sensorData = {
    moisture: '70',
    light: '100',
    temperature: '76',
    battery: '100'
  }
  const topicName = "sensor-data";

  // start a new camunda process
  const newProcessResp = await startNewProcess();
  expect(newProcessResp.status).toBe(200);  // there should not be a server error
  expect(newProcessResp.data.id).toBeTruthy() // there should be a new process id returned.

  // now fetch and lock one task waiting for sensor-data
  const lockResp = await fetchAndLock(topicName)
  expect(lockResp.status).toBe(200);
  const sensorDataExternalTaskId = lockResp.data.id;
  expect(sensorDataExternalTaskId).toBeTruthy();


  // now send in the sensor data
  const sendSensorDataResp = await sendSensorData(sensorDataExternalTaskId, sensorData)
  expect(sendSensorDataResp.status).toBe(204);

});



test('Temp is too low', async () => {
  // first, define some sensor data
  const sensorData = {
    moisture: '70',
    light: '100',
    temperature: '66',
    battery: '100'
  }
  const topicName = "sensor-data";

  // start a new camunda process
  const newProcessResp = await startNewProcess();
  expect(newProcessResp.status).toBe(200);  // there should not be a server error
  expect(newProcessResp.data.id).toBeTruthy() // there should be a new process id returned.

  // now fetch and lock one task waiting for sensor-data
  const lockResp = await fetchAndLock(topicName)
  expect(lockResp.status).toBe(200);
  const sensorDataExternalTaskId = lockResp.data.id;
  expect(sensorDataExternalTaskId).toBeTruthy();

  // now send in the sensor data
  const sendSensorDataResp = await sendSensorData(sensorDataExternalTaskId, sensorData)
  expect(sendSensorDataResp.status).toBe(204);

});

