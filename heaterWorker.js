require('dotenv').config()
const execAsync = require('util').promisify(require('child_process').exec);
// const { child, exec } = require('child_process');
const { Client, logger, Variables } = require('camunda-external-task-client-js');
const { resolve } = require('path');
const Notifier = require('./services/Notifier.js')

// configuration for the Client:
//  - 'baseUrl': url to the Process Engine
//  - 'logger': utility to automatically log important events
//  - 'asyncResponseTimeout': long polling timeout (then a new request will be issued)
const config = { baseUrl: process.env.CAMUNDA_BASE_URL + '/engine-rest' || 'http://localhost:8080/engine-rest', use: logger, asyncResponseTimeout: 10000};

console.log("[${new Date().toLocaleString()}] WORKER STARTED. Using Camunda Engine @ "+config.baseUrl)
// create a Client instance with custom configuration
const client = new Client(config);

const SwitchIpFromName = {
  'light': process.env.LIGHT_IP,
  'heater': process.env.HEAT_IP,
  'pump': process.env.WATER_IP,
}

/** 
 * poll status of device
 * 
 */
 async function getSwitchStatus(ip) {
  console.log("About to run: ", `./tplink_smartplug.py -t ${ip} -qc info`)
  try {
   const { error, stdout, stderr } = await execAsync(`./tplink_smartplug.py -t ${ip} -qc info`)
    if (error) {
        console.log(`error: ${error.message}`);
        return 'fail!!!!';
    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
        return 'fail!!!';
    }
    const r = JSON.parse(stdout)
    return r.system.get_sysinfo.relay_state === 1 ? true : false
  } catch (e) {
    console.error(e); // should contain code (exit code) and signal (that caused the termination).
    return false
  }
}


/** 
 * @name setSwitchStatus
 * @description Sets status true or false state for a wifi switch device
 * @argument switchName: enum of SwitchIpFromName
 * @argument newState: boolean
 * @returns void
 */
 async function setSwitchStatus(switchName, newState) {
  // console.log("About to run: ", `./tplink_smartplug.py -t ${ip} -qc info`)
  const ip = SwitchIpFromName[switchName]
  const newStateString = newState ? 'on' : 'off'
  try {
    const { error, stdout, stderr } = await execAsync(`./tplink_smartplug.py -t ${ip} -c ${newStateString}`)
    if (error) {
        console.log(`error: ${error.message}`);
        return 'fail!!!!';
    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
        return 'fail!!!';
    }
    console.log(`[${new Date().toLocaleString()}] {setSwitchStatus} switchName=${switchName} newState=${newStateString}`);
    return true
  } catch (e) {
    console.error(e); // should contain code (exit code) and signal (that caused the termination).
    return false
  }
}


/**
 * sensor-data
 */
//  client.subscribe('sensor-data', async function({ task, taskService }) {
  // const temperature = task.variables.get('temperature');
  // console.log(`[${new Date().toLocaleString()}] {sensor-data} task.businessKey=${task.businessKey}`);
  // console.log(`[${new Date().toLocaleString()}] {sensor-data} Running with new sensor-data: `, { temperature });
  // await taskService.complete(task);
// });

/**
 * heater-switch-state
 */
 client.subscribe('heater-switch-state', async function({ task, taskService }) {
  const switchStatus = await getSwitchStatus(SwitchIpFromName['heater'])
  console.log(`[${new Date().toLocaleString()}] {heater-switch-state} called for HEATER., which runs on IP: ${SwitchIpFromName['heater']}. Queried value says: switchStatus=${switchStatus}`);


  const processVariables = new Variables();
  processVariables.set("heaterState", switchStatus)
  await taskService.complete(task, processVariables);
});


/**
 * heater-on
 */
 client.subscribe('heater-on', async function({ task, taskService }) {
  console.log(`[${new Date().toLocaleString()}] {heater-on} called, which runs on IP: ${SwitchIpFromName['heater']}. Setting status to true`);
  await setSwitchStatus("heater", true)
  const processVariables = new Variables();
  processVariables.set("statusShouldBe", 'true');
  console.log(`[${new Date().toLocaleString()}] {heater-on} called, which runs on IP: ${SwitchIpFromName['heater']}. Setting status to true`);
  await taskService.complete(task, processVariables);
});


/**
 * heater-off
 */
client.subscribe('heater-off', async function({ task, taskService }) {
  console.log(`[${new Date().toLocaleString()}] {heater-off} called, which runs on IP: ${SwitchIpFromName['heater']}. Setting status to false.`);
  setSwitchStatus("heater", false)
  const processVariables = new Variables();
  processVariables.set("statusShouldBe", 'false');
  await taskService.complete(task, processVariables);
});



/**
 * temp-warning
 */
 client.subscribe('temp-warning', async function({ task, taskService }) {
  const tempVal = task.variables.get('temperature');
  console.log(`[${new Date().toLocaleString()}] {temp-warning} called, temperature is out of bounds, currently: ${tempVal}`);
  const notifierClient = new Notifier();
  const errorMessage = `[TEMP WARNING] temperature is out of bounds, currently: ${tempVal}`;
  await notifierClient.sendNotification(errorMessage)
  await taskService.handleFailure(task, {
    errorMessage,
    errorDetails: `Temp is currently: ${tempVal}`,
    retries: 0
  });
  //  await taskService.complete(task);
});



/**
 * water-plant
 */
 client.subscribe('water-plant', async function({ task, taskService }) {
  const moistureVal = task.variables.get('moisture')
  console.log(`[${new Date().toLocaleString()}] {water-plant} called, moisture should be too low. currently: ${moistureVal}`);
  const notifierClient = new Notifier();
  const msg = `[${new Date().toLocaleString()}] Watering plant. currently: ${moistureVal}`;
  await notifierClient.sendNotification(msg)
  await taskService.complete(task);
});


/**
 * confirm-heater-state
 */
 client.subscribe('confirm-heater-state', async function({ task, taskService }) {
  const switchStatus = await getSwitchStatus(SwitchIpFromName['heater'])
  const statusShouldBe = task.variables.get('statusShouldBe')
  console.log(`[${new Date().toLocaleString()}] {confirm-heater-state} called for HEATER., which runs on IP: ${SwitchIpFromName['heater']}. Queried value says: switchStatus=${switchStatus}. statusShouldBe=${statusShouldBe}`);
  if (switchStatus.toString() === statusShouldBe.toString()) {
    await taskService.complete(task);
  } else {
    const notifierClient = new Notifier();
    const errorMessage = `[${new Date().toLocaleString()}] {confirm-heater-state} CHECK FAILED! Error changing state of heater while trying to change it to ${statusShouldBe}. Currently it's ${switchStatus}. Try agai...!`
    await notifierClient.sendNotification(errorMessage)
    await taskService.handleFailure(task, {
      errorMessage,
      errorDetails: `Temp is currently: ${tempVal}`,
      retries: 1,
      retryTimeout: 10 * 1000
    });
  }
});




