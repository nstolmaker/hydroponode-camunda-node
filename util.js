require('dotenv').config()

const execAsync = require('util').promisify(require('child_process').exec);
// const { child, exec } = require('child_process');
const { Client, logger, Variables } = require('camunda-external-task-client-js');

const Consts = {
  LIGHTS_ON_TIME: process.env.LIGHTS_ON_TIME,
  LIGHTS_OFF_TIME: process.env.LIGHTS_OFF_TIME,
  THROTTLE_SWITCH_TIME: process.env.THROTTLE_SWITCH_TIME,
  LIGHT_IP: process.env.LIGHT_IP,
  HEAT_IP: process.env.HEAT_IP,
  WATER_IP: process.env.WATER_IP,
  CAMUNDA_BASE_URL: process.env.CAMUNDA_BASE_URL,
}

const SwitchIpFromName = {
  'light': Consts.LIGHT_IP,
  'heater': Consts.HEAT_IP,
  'pump': Consts.WATER_IP,
}

/** 
 * poll status of device
 * 
 */
 async function getSwitchStatus(ip) {
  // console.log("About to run: ", `./tplink_smartplug.py -t ${ip} -qc info`)
  try {
   const { error, stdout, stderr } = await execAsync(`${__dirname}/tplink_smartplug.py -t ${ip} -qc info`)
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
    const { error, stdout, stderr } = await execAsync(`${__dirname}/tplink_smartplug.py -t ${ip} -c ${newStateString}`)
    if (error) {
        console.log(`error: ${error.message}`);
        return 'fail!!!!';
    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
        return 'fail!!!';
    }
    // console.log(`[${new Date().toLocaleString()}] {setSwitchStatus} switchName=${switchName} newState=${newStateString}`);
    return true
  } catch (e) {
    console.error(e); // should contain code (exit code) and signal (that caused the termination).
    return false
  }
}

module.exports = { getSwitchStatus, setSwitchStatus, SwitchIpFromName, Consts }