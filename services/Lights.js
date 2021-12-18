/* CONTROL THE LIGHTS! */
require('dotenv').config()
const {Consts} = require('../util.js');
const { DateTime, Interval } = require("luxon");
const Broadcast = require('./Broadcast.js')
const execAsync = require('util').promisify(require('child_process').exec);

class Lights {
  constructor() {
    this.Consts = Consts
    console.log("Did the constants make it in? ")
    console.log(this.Consts)
    // if stopTime < startTime then they mean that time in the AM *tomorrow*. The luxon library will handle the date math for us, so just add 24 hours.
    if (this.Consts.LIGHTS_OFF_TIME < this.Consts.LIGHTS_ON_TIME) this.Consts.LIGHTS_OFF_TIME +=24;
  }
  async function switchOff() {
    console.log("💡⬇️ Turning off switch");
	  try {
	    const { error, stdout, stderr } = await execAsync("./tplink_smartplug.py -t "+this.Consts.LIGHT_IP+" -c off");
	      if (error) {
		  console.log(`error: ${error.message}`);
		  return;
	      }
	      if (stderr) {
		  console.log(`stderr: ${stderr}`);
		  return;
	      }
	      console.log(`stdout: ${stdout}`);
	      return stdout;
	  } catch (e) {
	    console.error(e); // should contain code (exit code) and signal (that caused the termination).
	    return false
	  }
  }
  switchOn = async function() {
    console.log("💡⬆️ Turning on switch")
    return execAsync("./tplink_smartplug.py -t "+this.Consts.LIGHT_IP+" -c on", (error, stdout, stderr) => {
      if (error) {
          console.log(`error: ${error.message}`);
          return;
      }
      if (stderr) {
          console.log(`stderr: ${stderr}`);
          return;
      }
      // console.log(`stdout: ${stdout}`);
    });
  };
  async manageLights(lux) {
    const startTimeDT = DateTime.local().startOf("day").plus({hours: this.Consts.LIGHTS_ON_TIME});
    const stopTimeDT = DateTime.local().startOf("day").plus({hours: this.Consts.LIGHTS_OFF_TIME});
    const onInterval = Interval.fromDateTimes(startTimeDT, stopTimeDT);
    const currentTimeDT = DateTime.local();
    const onOrOff = onInterval.contains(currentTimeDT);

    const broadcast = new Broadcast();
    const actionData = {
      system: 'lights',
      action: 'undefined',
      message: 'going to attempt to switch lights because lux is: ' + lux
    }
    console.log("debugging 4");
    if (onOrOff) {
      console.log("Lights should be on");
      await broadcast.recordActionHistoryInDb(actionData);
      actionData.action = "on";
      // if (lux < this.Consts.GREENHOUSE_LIGHT_MIN) {
          await broadcast.recordActionHistoryInDb(actionData);
          await this.switchOn();
          return { 'lightShouldBe': 'true' };
      // }
    } else {
      console.log("lights should be off")
      actionData.action = "off";
      await broadcast.recordActionHistoryInDb(actionData);
      const switchResponse = await this.switchOff();
	    console.log("switchoff returned. returning from manageLight function", switchResponse);
      return { 'lightShouldBe': 'false' };
    }
  };
}

module.exports = Lights
