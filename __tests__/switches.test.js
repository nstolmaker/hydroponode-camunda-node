require('dotenv').config()
const { logger } = require('camunda-external-task-client-js');
const { Consts } = require('../util.js')
const { SwitchIpFromName, setSwitchStatus, getSwitchStatus } = require('../util.js')

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
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


test('Light switch is controllable', async () => {
  // test the light
  // first turn it off

  // remember the current value so we can put it back afterwards
  const previousValue = await getSwitchStatus(SwitchIpFromName['light']);
  setSwitchStatus('light', false)

  // wait for it to be off
  // console.log("waiting for light to be off:\n")
  let waitResponse = await waitForSwitchState('light', false)
  // console.log("waitResponse is: ", waitResponse)
  expect(waitResponse).toBe(false)

  // console.log("Okay now turning the light on on:\n")
  setSwitchStatus('light', true)
  waitResponse = await waitForSwitchState('light', true)
  expect(waitResponse).toBe(true)
  
  setSwitchStatus('light', previousValue)
  waitResponse = await waitForSwitchState('light', previousValue)
  expect(waitResponse).toBe(previousValue)
});



test('Heat switch is controllable', async () => {
  // test the light
  // first turn it off

  // remember the current value so we can put it back afterwards
  const previousValue = await getSwitchStatus(SwitchIpFromName['heater']);
  setSwitchStatus('heater', false)

  // wait for it to be off
  // console.log("waiting for heater to be off:\n")
  let waitResponse = await waitForSwitchState('heater', false)
  // console.log("waitResponse is: ", waitResponse)
  expect(waitResponse).toBe(false)

  // console.log("Okay now turning the heater on on:\n")
  setSwitchStatus('heater', true)
  waitResponse = await waitForSwitchState('heater', true)
  expect(waitResponse).toBe(true)
  
  setSwitchStatus('heater', previousValue)
  waitResponse = await waitForSwitchState('heater', previousValue)
  expect(waitResponse).toBe(previousValue)
});



test('Pump switch is controllable', async () => {
  // test the pump
  // first turn it off

  // remember the current value so we can put it back afterwards
  const previousValue = await getSwitchStatus(SwitchIpFromName['pump']);
  setSwitchStatus('pump', false)

  // wait for it to be off
  // console.log("waiting for pump to be off:\n")
  let waitResponse = await waitForSwitchState('pump', false)
  // console.log("waitResponse is: ", waitResponse)
  expect(waitResponse).toBe(false)

  // console.log("Okay now turning the pump on on:\n")
  setSwitchStatus('pump', true)
  waitResponse = await waitForSwitchState('pump', true)
  expect(waitResponse).toBe(true)
  
  setSwitchStatus('pump', previousValue)
  waitResponse = await waitForSwitchState('pump', previousValue)
  expect(waitResponse).toBe(previousValue)
});