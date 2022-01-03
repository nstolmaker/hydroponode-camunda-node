require('dotenv').config()

const execAsync = require('util').promisify(require('child_process').exec);
// const { child, exec } = require('child_process');
const { Client, logger, Variables } = require('camunda-external-task-client-js');

const Consts = {
  LIGHTS_ON_TIME: parseInt(process.env.LIGHTS_ON_TIME),
  LIGHTS_OFF_TIME: parseInt(process.env.LIGHTS_OFF_TIME),
  THROTTLE_SWITCH_TIME: process.env.THROTTLE_SWITCH_TIME,
  LIGHT_IP: process.env.LIGHT_IP,
  HEAT_IP: process.env.HEAT_IP,
  WATER_IP: process.env.WATER_IP,
  CAMUNDA_BASE_URL: process.env.CAMUNDA_BASE_URL,
  CAMUNDA_PROCESS_NAME: process.env.CAMUNDA_PROCESS_NAME,
  engineConfig: { baseUrl: process.env.CAMUNDA_BASE_URL + '/engine-rest' || 'http://localhost:8080/engine-rest', use: logger, asyncResponseTimeout: 10000},
  BIRDSNEST_DOMAIN: process.env.BIRDSNEST_DOMAIN,
  GREENHOUSE_LIGHT_MIN: 20,
  WATERING_DURATION: parseInt(process.env.WATERING_DURATION) || 3,
  GREENHOUSE_MOISTURE_MIN: parseInt(process.env.GREENHOUSE_MOISTURE_MIN)
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
    const [err, parsedContent] = safeParse(stdout, JSON.parse)
    const r = parsedContent ? parsedContent : err
    if (err) throw new Error(`[${new Date().toLocaleString()}] [getSwitchStatus] Unable to parse response from switch status: `, err)
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
  const ip = SwitchIpFromName[switchName];
	 if (ip == 'undefined') { console.log("Ip is undefined for switchName " + switchName + " something is not right. here is the value of Consts:", Consts); }
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

// function safeParse(str:string, parse:(content: string)=>any) {
function safeParse(str, parse) {
  try {
      return [null, parse(str)];
  } catch (err) {
      return [err];
  }
}

async function waitForSwitchState(switchName, desiredState) {
  let startTime = new Date().getTime()
  let switchStatus;
  do {
    switchStatus = await getSwitchStatus(SwitchIpFromName[switchName])
    // console.log(`[waitForSwitchState_LOOP]`, {desiredState, switchStatus})
    // console.log( {switchStatus})
    await sleep(500)
    let now = new Date().getTime()
    let timeElapsed = now - startTime
    if (timeElapsed > 4 * 900) {
      console.log("ERROR waitForSwitchState TIMING OUT")
      return switchStatus
      break;
    }
  } while (switchStatus != desiredState);
  // console.log("Done, returning switchStatus: ", switchStatus)
  return switchStatus
}


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = { getSwitchStatus, setSwitchStatus, SwitchIpFromName, Consts, safeParse, waitForSwitchState, sleep }
