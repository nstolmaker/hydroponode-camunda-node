require('dotenv').config()
const { child, exec } = require('child_process');
const { Client, logger, Variables } = require('camunda-external-task-client-js');
const { resolve } = require('path');


// configuration for the Client:
//  - 'baseUrl': url to the Process Engine
//  - 'logger': utility to automatically log important events
//  - 'asyncResponseTimeout': long polling timeout (then a new request will be issued)
const config = { baseUrl: process.env.CAMUNDA_BASE_URL + '/engine-rest' || 'http://localhost:8080/engine-rest', use: logger, asyncResponseTimeout: 10000 };

console.log("Using Camunda Engine @ "+config.baseUrl)
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
  // console.log("About to run: ", `./tplink_smartplug.py -t ${ip} -qc info`)
  exec(`./tplink_smartplug.py -t ${ip} -qc info`, async (error, stdout, stderr) => {
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
  });
  return false
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
  /* exec(`./tplink_smartplug.py -t ${ip} -c ${newStateString}`, async (error, stdout, stderr) => {
    if (error) {
        console.log(`error: ${error.message}`);
        return 'fail!!!!';
    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
        return 'fail!!!';
    }
  });
  */

  console.log(`[${new Date().toLocaleString()}] {setSwitchStatus} switchName=${switchName} newState=${newStateString}`);
  return
}


/**
 * sensor-data
 */
 client.subscribe('sensor-data', async function({ task, taskService }) {
  const temperature = task.variables.get('temperature');
  console.log(`[${new Date().toLocaleString()}] {get-sensor-data} task.businessKey=${task.businessKey}`);
  console.log(`[${new Date().toLocaleString()}] {get-sensor-data} Running with new sensor-data: `, { temperature });
  await taskService.complete(task);
});

/**
 * heater-switch-state
 */
 client.subscribe('heater-switch-state', async function({ task, taskService }) {
  const switchStatus = await getSwitchStatus(SwitchIpFromName['heater'])
  console.log(`[${new Date().toLocaleString()}] {switch-status-pump} called, which runs on IP: ${SwitchIpFromName['heater']}. pumpStatus=${switchStatus}`);


  const processVariables = new Variables();
  processVariables.set("heaterState", true)
  await taskService.complete(task, processVariables);
});


/**
 * heater-on
 */
 client.subscribe('heater-on', async function({ task, taskService }) {
  setSwitchStatus("heater", true)
  console.log(`[${new Date().toLocaleString()}] {heater-on} called, which runs on IP: ${SwitchIpFromName['heater']}. Setting status to true`);
  await taskService.complete(task);
});


/**
 * heater-off
 */
 client.subscribe('heater-off', async function({ task, taskService }) {
  setSwitchStatus("heater", false)
  console.log(`[${new Date().toLocaleString()}] {heater-off} called, which runs on IP: ${SwitchIpFromName['heater']}. Setting status to false`);
  await taskService.complete(task);
});



/**
 * temp-warning
 */
 client.subscribe('temp-warning', async function({ task, taskService }) {
   const tempVal = task.variables.get('temperature')
  console.log(`[${new Date().toLocaleString()}] {temp-warning} called, temperature is out of bounds, currently: ${tempVal}`);
  await taskService.complete(task);
});


