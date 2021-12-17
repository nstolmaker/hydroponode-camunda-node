require('dotenv').config()
// const axios = require('axios').default
const { Client, logger, Variables } = require('camunda-external-task-client-js');
const { Consts } = require('../util.js');
const { SwitchIpFromName, setSwitchStatus, getSwitchStatus, waitForSwitchState } = require('../util.js');
const WorkflowSubscriptions = require('../services/WorkflowSubscriptions.js');

let client;
let workflow;
jest.setTimeout(60 * 1000); // could take up to a minute before camunda calls it

beforeEach(() => {
  // we will need a running worker to make the tests work I think.
  console.log("[${new Date().toLocaleString()}] WORKER STARTING. Using Camunda Engine @ "+Consts.engineConfig.baseUrl)
  client = new Client(Consts.engineConfig);
  workflow = new WorkflowSubscriptions(client)
})


afterEach(() => {
  client.stop();
});


describe('Lights are off and should be on (daytime)', () => {
  // mocked sensor data and real topic name.
  const sensorData = {
    moisture: '70',
    light: '0',
    temperature: '78',
    battery: '100'
  }
  const topicName = "sensor-data";
  const shouldBe = {
    light: true,
    pump: false,
    heater: false
  }
  
  // mock of subscription functions we are using in this test
  const subscriptionMock = {
    manageLight: async function({ task, taskService }) {
      const processVariables = new Variables();
      processVariables.set("lightStateShouldBe", shouldBe.light)
      await setSwitchStatus('light', shouldBe.light)
      await waitForSwitchState('light', shouldBe.light)
      await taskService.complete(task, processVariables);
    },
    confirmLightState: async function({ task, taskService }) {
      const switchStatus = await getSwitchStatus(SwitchIpFromName['light'])
      const statusShouldBe = await task.variables.get('lightStateShouldBe') || null
      console.log(`[${new Date().toLocaleString()}] {confirm-light-state} called for LIGHT, which runs on IP: ${SwitchIpFromName['light']}. Queried value says: switchStatus=${switchStatus}. statusShouldBe=${statusShouldBe}`);
      // console.log(`testing if: ${switchStatus.toString()} === ${statusShouldBe?.toString()}`)
      if (statusShouldBe !== null && switchStatus.toString() === statusShouldBe.toString()) {
        console.log(`[${new Date().toLocaleString()}] {confirm-light-state} is correct.`)
        await taskService.complete(task);
      } else {
        const errorMessage = `[${new Date().toLocaleString()}] {confirm-light-state} CHECK FAILED! Error changing state of lights while trying to change it to ${statusShouldBe}. Currently it's ${switchStatus}. Try again...!`
        console.log(errorMessage)
        await taskService.handleFailure(task, {
          errorMessage,
          errorDetails: `light-state is currently: ${switchStatus}, should be ${statusShouldBe}`,
          retries: 1,
          retryTimeout: 10 * 1000
        });
      }
    },
    waterPumpSwitchState: async function({ task, taskService }) {
      const processVariables = new Variables();
      processVariables.set("waterPumpState", await getSwitchStatus(SwitchIpFromName['pump']))
      await taskService.complete(task, processVariables);
    },
  }
  

  it('should create a new process', async () => {
    // start a new camunda process
    const newProcessResp = await startNewProcess();
    expect(newProcessResp.status).toBe(200);  // there should not be a server error
    expect(newProcessResp.data.id).toBeTruthy() // there should be a new process id returned.
  });

  let sensorDataExternalTaskId; // make this global so it's preserved between child assertions
  it('should fetch and lock one', async () => {
    // now fetch and lock one task waiting for sensor-data
    const lockResp = await fetchAndLock(topicName)
    expect(lockResp.status).toBe(200);
    sensorDataExternalTaskId = lockResp.data.id;
    expect(sensorDataExternalTaskId).toBeTruthy();
  });
  

  it('should send in sensor data', async () => {
    // now send in the sensor data
    console.log({sensorDataExternalTaskId})
    await sendSensorData(sensorDataExternalTaskId, sensorData)
    expect(sendSensorDataResp.status).toBe(204);
  });


  it('should determine proper light switch state', async () => {
    const manageLightSPY = jest.spyOn(subscriptionMock, 'manageLight');
    const manageLightPromise = new Promise((resolve, reject) => {
      client.subscribe('manage-light', async ({task, taskService})=>{ 
        await subscriptionMock.manageLight({task, taskService}); 
        resolve();
      });
    });
    await manageLightPromise;
    expect(manageLightSPY).toHaveBeenCalled();
  });


  it('should confirm light switch state', async () => {
    const confirmLightStateSPY = jest.spyOn(subscriptionMock, 'confirmLightState');
    const confirmLightStatePromise = new Promise((resolve, reject) => {
      client.subscribe('confirm-light-state', async ({task, taskService})=>{ 
        await subscriptionMock.confirmLightState({task, taskService}); 
        resolve();
      });
    });
    await confirmLightStatePromise;
    expect(confirmLightStateSPY).toHaveBeenCalled();
  });



  it('should query water switch state', async () => {
    const waterPumpSwitchStateSPY = jest.spyOn(subscriptionMock, 'waterPumpSwitchState');
    const waterPumpSwitchStatePromise = new Promise((resolve, reject) => {
      client.subscribe('water-pump-switch-state', async ({task, taskService})=>{ 
        await subscriptionMock.waterPumpSwitchState({task, taskService}); 
        resolve();
      });
    });
    await waterPumpSwitchStatePromise;
    expect(waterPumpSwitchStateSPY).toHaveBeenCalled();
  });

  
});







/** 
 * NEXT UP, TURN OFF THE LIGHTS IF IT'S NIGHT TIME
 */

describe('Lights are on and should be OFF (NIGHTtime)', () => {
  // mocked sensor data and real topic name.
  const sensorData = {
    moisture: '70',
    light: '100',
    temperature: '89',
    battery: '100'
  }
  const topicName = "sensor-data";
  const shouldBe = {
    light: false,
    pump: false,
    heater: false
  }
  // mock of subscription functions we are using in this test
  const subscriptionMock = {
    manageLight: async function({ task, taskService }) {
      const processVariables = new Variables();
      processVariables.set("lightStateShouldBe", shouldBe.light)
      await setSwitchStatus('light', shouldBe.light);
      console.log("Waiting for lights to turn to state: ", shouldBe.light)
      await waitForSwitchState('light', shouldBe.light);
      console.log("DOne waiting!");
      await taskService.complete(task, processVariables);
    },
    confirmLightState: async function({ task, taskService }) {
      const switchStatus = await getSwitchStatus(SwitchIpFromName['light'])
      const statusShouldBe = await task.variables.get('lightStateShouldBe');
      console.log(`[${new Date().toLocaleString()}] {confirm-light-state} called for LIGHT, which runs on IP: ${SwitchIpFromName['light']}. Queried value says: switchStatus=${switchStatus}. statusShouldBe=${statusShouldBe}`);
      // console.log(`testing if: ${switchStatus.toString()} === ${statusShouldBe?.toString()}`)
      if (statusShouldBe !== null && switchStatus.toString() === statusShouldBe.toString()) {
        console.log(`[${new Date().toLocaleString()}] {confirm-light-state} is correct.`)
        await taskService.complete(task);
        return true;
      } else {
        const errorMessage = `[${new Date().toLocaleString()}] {confirm-light-state} CHECK FAILED! Error changing state of lights while trying to change it to ${statusShouldBe}. Currently it's ${switchStatus}. Try again...!`
        console.error(errorMessage)
        await taskService.handleFailure(task, {
          errorMessage,
          errorDetails: `light-state is currently: ${switchStatus}, should be ${statusShouldBe}`,
          retries: 1,
          retryTimeout: 10 * 1000
        });
        return false;
      }
    },
    heaterSwitchState: async function({ task, taskService }) {
      const processVariables = new Variables();
      processVariables.set("heaterState", await getSwitchStatus(SwitchIpFromName['heater']))
      await taskService.complete(task, processVariables);
    },
    waterPumpSwitchState: async function({ task, taskService }) {
      const processVariables = new Variables();
      processVariables.set("waterPumpState", await getSwitchStatus(SwitchIpFromName['pump']))
      await taskService.complete(task, processVariables);
    },
  }

  it('should create a new process', async () => {
    // start a new camunda process
    const newProcessResp = await startNewProcess();
    expect(newProcessResp.status).toBe(200);  // there should not be a server error
    expect(newProcessResp.data.id).toBeTruthy() // there should be a new process id returned.
  });

  let sensorDataExternalTaskId; // make this global so it's preserved between child assertions
  it('should fetch and lock one', async () => {
    // now fetch and lock one task waiting for sensor-data
    const lockResp = await fetchAndLock(topicName)
    expect(lockResp.status).toBe(200);
    sensorDataExternalTaskId = lockResp.data.id;
    expect(sensorDataExternalTaskId).toBeTruthy();
  });
  

  it('should send in sensor data', async () => {
    // now send in the sensor data
    console.log({sensorDataExternalTaskId})
    await sendSensorData(sensorDataExternalTaskId, sensorData)
    expect(sendSensorDataResp.status).toBe(204);
  });


  it('should determine proper light switch state', async () => {
    const manageLightSPY = jest.spyOn(subscriptionMock, 'manageLight');
    const manageLightPromise = new Promise((resolve, reject) => {
      client.subscribe('manage-light', async ({task, taskService})=>{ 
        await subscriptionMock.manageLight({task, taskService}); 
        resolve();
      });
    });
    await manageLightPromise;
    expect(manageLightSPY).toHaveBeenCalled();
  });


  it('should confirm light switch state', async () => {
    const confirmLightStateSPY = jest.spyOn(subscriptionMock, 'confirmLightState');
    const confirmLightStatePromise = new Promise((resolve, reject) => {
      client.subscribe('confirm-light-state', async ({task, taskService})=>{ 
        await subscriptionMock.confirmLightState({task, taskService}); 
        resolve();
      });
    });
    await confirmLightStatePromise;
    expect(confirmLightStateSPY).toHaveBeenCalled();
  });


  it('should query heater switch state', async () => {
    const heaterSwitchStateSPY = jest.spyOn(subscriptionMock, 'heaterSwitchState');
    const heaterSwitchStatePromise = new Promise((resolve, reject) => {
      client.subscribe('heater-switch-state', async ({task, taskService})=>{ 
        await subscriptionMock.heaterSwitchState({task, taskService}); 
        resolve();
      });
    });
    await heaterSwitchStatePromise;
    expect(heaterSwitchStateSPY).toHaveBeenCalled();
  });


  it('should query water switch state', async () => {
    const waterPumpSwitchStateSPY = jest.spyOn(subscriptionMock, 'waterPumpSwitchState');
    const waterPumpSwitchStatePromise = new Promise((resolve, reject) => {
      client.subscribe('water-pump-switch-state', async ({task, taskService})=>{ 
        await subscriptionMock.waterPumpSwitchState({task, taskService}); 
        resolve();
      });
    });
    await waterPumpSwitchStatePromise;
    expect(waterPumpSwitchStateSPY).toHaveBeenCalled();
  });

});