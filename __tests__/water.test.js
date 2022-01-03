require('dotenv').config()
const { logger } = require('camunda-external-task-client-js');
const { Consts } = require('../util.js');
const { SwitchIpFromName, getSwitchStatus, setSwitchStatus, waitForSwitchState, sleep } = require('../util.js');
const WorkflowSubscriptions = require('../services/WorkflowSubscriptions');
const Broadcast = require('../services/Broadcast');
const Notifier = require('../services/Notifier');
// jest.mock('../services/WorkflowSubscriptions');

jest.mock('../util');
jest.mock('../services/Broadcast')
jest.mock('../services/Notifier')
// getSwitchStatus.mockReturnValueOnce(true).mockReturnValueOnce(false).mockReturnValueOnce(true)
// .mockReturnValueOnce(true).mockReturnValueOnce(false).mockReturnValueOnce(true);

// setSwitchStatus.mockReturnValue(true)

// waitForSwitchState.mockReturnValueOnce(false).mockReturnValueOnce(true).mockReturnValueOnce(true).mockReturnValueOnce(false).mockReturnValueOnce(true).mockReturnValueOnce(false).mockReturnValueOnce(false).mockReturnValueOnce(true).mockReturnValueOnce(true)


describe('waterering works', () => {
  
//   const setSwitchStatus = jest.fn().mockImplementation(() => {
//     return true;
//   })
//   const getSwitchStatus = jest.fn().mockImplementationOnce(() => {
//     return 'foo'
//   }).mockImplementationOnce(()=> {
//     return false
//   }).mockImplementationOnce(()=> {
//     return true
//   });


  // it('status should return based on mocks', async () => {

  //   let pumpStatus;
  //   pumpStatus = await getSwitchStatus(SwitchIpFromName['light']);
  //   expect(pumpStatus).toEqual('foo');

  //   pumpStatus = await getSwitchStatus(SwitchIpFromName['light']);
  //   setSwitchStatus('light', false);
  //   expect(pumpStatus).toEqual(false);

  //   pumpStatus = await getSwitchStatus(SwitchIpFromName['light']);
  //   setSwitchStatus('light', true);
  //   expect(pumpStatus).toEqual(true);
    
  // });

  it('properly mocks the pump functions so nothing changes', async () => {
    const workflowSubscriptions = new WorkflowSubscriptions();
    const task = {
      variables: {
        get: function(key) {
          return ('-100')
        }
      }
    }
    const taskService = {
      complete: function () {
        console.log("TEST MOCK: taskService.complete() executed");
      } //mock.fn()?
    }
    getSwitchStatus.mockReturnValueOnce(false)
    setSwitchStatus.mockReturnValue(true)
    await workflowSubscriptions.waterPlant({task, taskService});
    // TODO: replace with water-pump-switch-state when sure its working
    expect(getSwitchStatus).toHaveBeenCalledTimes(1);
  })
});