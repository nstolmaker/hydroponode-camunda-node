/* CONTROL THE Pumps!! */
require('dotenv').config()
const {Consts, sleep} = require('../util.js');
const Broadcast = require('./Broadcast.js')
const execAsync = require('util').promisify(require('child_process').exec);
const { getSwitchStatus, setSwitchStatus, waitForSwitchState, SwitchIpFromName } = require('../util.js')
const Notifier = require('../services/Notifier');


class Pumps {
  constructor() {
    this.Consts = Consts
  }
  sleep = function(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  hydrate = async function(moisture) {
    console.log("🌧 Starting Watering @ "+new Date().toLocaleString()+".")
    const broadcast = new Broadcast();
    const actionData = {
      system: 'pump',
      action: 'on',
      message: `going to attempt to turn ON pump because moisture is ${moisture}`
    }
    await broadcast.recordActionHistoryInDb(actionData);
    await setSwitchStatus("pump", true);
    await this.sleep(this.Consts.WATERING_DURATION);

    console.log("🌤 Stopping Watering @ "+new Date().toLocaleString()+".")
    await setSwitchStatus("pump", false);
    const turnOffSwitchTimedOut = await waitForSwitchState("pump", false);
    if (turnOffSwitchTimedOut) {
      let notifier = new Notifier;
      const pumpFailedToTurnOffErrorMsg = "Failed to turn off the pump. Going to try again one more time. If this happens once, you need to go put in more robust retry functions in here. Moisture was: "+moisture+"%. Watering now.";
      console.log("🚨 "+ pumpFailedToTurnOffErrorMsg)
      notifier.sendNotification(pumpFailedToTurnOffErrorMsg);
      await setSwitchStatus("pump", false);
    }
    const endActionData = {
      system: 'pump',
      action: 'off',
      message: 'going to attempt to turn OFF pump, watering should be done'
    }
    await broadcast.recordActionHistoryInDb(endActionData);
    return true;
  };


  // switchOff = async function() {
  //   console.log("💡⬇️ Turning off switch");
	//   try {
	//     const { error, stdout, stderr } = await execAsync("./tplink_smartplug.py -t "+this.Consts.WATER_IP+" -c off");
	//       if (error) {
  //         console.log(`error: ${error.message}`);
  //         return;
	//       }
	//       if (stderr) {
  //         console.log(`stderr: ${stderr}`);
  //         return;
	//       }
	//       // console.log(`stdout: ${stdout}`);
	//       return true;
	//   } catch (e) {
	//     console.error(e); // should contain code (exit code) and signal (that caused the termination).
	//     return false
	//   }
  // }
  // switchOn = async function() {
  //   console.log("💡⬆️ Turning on switch")
  //   try {
  //     const { error, stdout, stderr } = await execAsync("./tplink_smartplug.py -t "+this.Consts.WATER_IP+" -c on");
  //     if (error) {
  //       console.log(`error: ${error.message}`);
  //       return;
  //     }
  //     if (stderr) {
  //       console.log(`stderr: ${stderr}`);
  //       return;
  //     }
  //     // console.log(`stdout: ${stdout}`);
  //     return true;
  //   } catch (e) {
  //     console.error(e); // should contain code (exit code) and signal (that caused the termination).
  //     return false
  //   }
  // };
  async managePumps(moisture) {
    try {
      const switchStatus = await getSwitchStatus(SwitchIpFromName['pump']);
      if (switchStatus) {
        console.log("WARNING! pump switch is returning ON, but it should be off because it's a pump and we haven't started it yet. Did it get left on? Or is the IP address pointing to the wrong device?");
      }
    } catch (err) {
      throw new Error("managePumps Failed to getSwitchStatus, maybe the sswitch isn't plugged in?")
    }

    const itsTooDry = parseInt(moisture) < this.Consts.GREENHOUSE_MOISTURE_MIN;
    const itsWayTooDry = parseInt(moisture) < (this.Consts.GREENHOUSE_MOISTURE_MIN - 10);


    if (itsTooDry) {
      let notifier = new Notifier;
      console.log("💧🔫 Moisture level too dry: "+moisture+"%. Watering now.");
      await this.hydrate(moisture);
      console.log("💧✅ this.hydrate is done.")
    } else {
      console.log("💧✅ Moisture is at an acceptable level. ");
    }

    if (itsWayTooDry) {
      let notifier = new Notifier;
      notifier.sendNotification("WARNING! MOISTURE IS OUT OF BOUNDS. Currently: "+moisture);
    }

    // TODO: save last moisture level and check to confirm it went up 
    return { pumpStateShouldBe: true }

  };
}

module.exports = Pumps
