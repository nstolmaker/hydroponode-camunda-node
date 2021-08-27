require('dotenv').config()
const { child, exec } = require('child_process');
const { Client, logger, Variables } = require('camunda-external-task-client-js');


// configuration for the Client:
//  - 'baseUrl': url to the Process Engine
//  - 'logger': utility to automatically log important events
//  - 'asyncResponseTimeout': long polling timeout (then a new request will be issued)
const config = { baseUrl: process.env.CAMUNDA_BASE_URL + '/engine-rest' || 'http://localhost:8080/engine-rest', use: logger, asyncResponseTimeout: 10000 };

// create a Client instance with custom configuration
const client = new Client(config);

