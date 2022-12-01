# PointsAPI

Follow these steps to run this API

1. Download and install Node JS from here: https://nodejs.org/en/download/
2. Install express from: https://expressjs.com/ using **npm install express --save**
3. git clone this repo: https://github.com/yueshanwang/PointsAPI.git
4. From your command line/terminal in /PointsAPI, run **node app.js**
5. Download and install postman from here:https://www.postman.com/downloads/
6. Using postman, create new HTTP requests and send them to **localhost:4000** to interact with the web service
7. http://localhost:4000/api/add will call the add transaction route. You will need to define the body of the request using a JSON and specify a "payer" and "points"
8. http://localhost:4000/api/spend will call the spend points route. Specify a positive amount of points in the url to spend
9. http://localhost:4000/api/balances will call the payer point balances route
