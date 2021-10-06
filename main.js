require('dotenv').config()

const { Consts, setSwitchStatus, getSwitchStatus, SwitchIpFromName } = require('../util.js')

const Lights = require('./services/Lights.js')
const Notifier = require('./services/Notifier.js')
const WorkflowSubscriptions = require('./services/WorkflowSubscriptions.js')

// configuration for the Client:
//  - 'baseUrl': url to the Process Engine
//  - 'logger': utility to automatically log important events
//  - 'asyncResponseTimeout': long polling timeout (then a new request will be issued)
const config = { baseUrl: Consts.CAMUNDA_BASE_URL + '/engine-rest' || 'http://localhost:8080/engine-rest', use: logger, asyncResponseTimeout: 10000};

console.log("[${new Date().toLocaleString()}] WORKER STARTED. Using Camunda Engine @ "+config.baseUrl)
// create a Client instance with custom configuration
const client = new Client(config);

const workflow = new WorkflowSubscriptions(client)
