If you want to use ES6 modules for the jest tests, change the test command in package.json to:
    ```/* "test": "NODE_OPTIONS=--experimental-vm-modules npx jest" */```


# NOTS FOR THIS PROJECT SO I DONT FORGET!

Mostly switched to npm now, because yarn wasn't working for something ages ago. Don't even remember why.

We need to use node v12 because @abandonware/noble doesn't support anything beyond that. Because of this, I'm using the oldschool require() imports instead of full ECMA script, which is kinda anoying.

There are too many repos, they need to be smushed at some point, but:

- The original project is now here: https://github.com/nstolmaker/hydroponode
    As of 12/17/2021 `main` is up-to-date and all the other branches are extra, except maybe the cleaning one. Not sure if I ran that.
    Anyway I added some of the action history stuff there but mostly the intent is that it will be slowly cut down to just the bit that fetches sensor data and sends it off, and then eventually I'll merge that code into it's own process and merge it into the new hydroponode-workflow-node solution.

- The nestjs (birdsnesst) project is here: https://github.com/nstolmaker/nestjs-microservice-base
    To start it, run `npm run start` (or see package.json).
    Some of the tests work here right now, but not all of them because I haven't looked into what I'm doing wrong there. Nestjs is awesome but very picky.
    You can generate a new resource with `nest g resource action_history`, which is fun.


- The NEW project, using camunda and workers lives here: https://github.com/nstolmaker/hydroponode-workflow-node
    It runs on the raspberry pi in /home/nstolmaker/hydroponode-camunda-node and it's state is managed by pm2.
    - to "install" the pm2 job for this guy, just run the ./start.sh script.

- CDK Deployment repo: https://github.com/nstolmaker/cdk-camunda-deployment
    To use: make sure you're configured to use AWS via `aws configure` and then you can just `cdk synth && cdk deploy` and it should just work.

- The UI project lives here: https://github.com/nstolmaker/hydroponode-ui 
    It's deployed to github user pages somehow: https://nstolmaker.github.io/hydroponode-ui/
    - Remember to set the CORS policy in the birdsnest app (main.ts) if you want to use another entrypoint than nstolmaker.github.io.

TODO: Add a "clear" feature to the sensorData table, or at least add a "most-recent-sensor-data" endpoint instead of pulling 2200 rows or whatever it's doing right now.

