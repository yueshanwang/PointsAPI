const express = require('express');
const app = express();
app.use(express.json());

var port = process.env.PORT || 4000;

//array of transactions, both adding and spending
var transactions = []

//array of remaining points still spendable
var remainingPoints = []

//comparison function that compares based on timestamp
function compare(a,b) {

    if (a.timestamp < b.timestamp){
        return -1;
    }
    if (a.timestamp > b.timestamp){
        return 1;
     }
    return 0;
}

app.get('/', (req, res) => {
    res.send('Welcome to Yueshan\'s web service');
});

//add transaction route
app.put("/api/add", (req, res) =>{

    if(!req.body){
     res.status(400).send("No body in request");
     return;
    }

    if (!req.body.payer){
        res.status(400).send("No payer name");
        return;
    }

    var timestampJSON = req.body.timestamp;

    if(!req.body.timestamp){
        timestampJSON = new Date().toJSON();
    }

  const transaction = {
    payer: req.body.payer,
    points: req.body.points,
    timestamp: timestampJSON
  };

  const remaining = {
      payer: req.body.payer,
      points: req.body.points,
      timestamp: timestampJSON
  }

  transactions.push(transaction);
  transactions.sort(compare);
  remainingPoints.push(remaining);
  remainingPoints.sort(compare);
  res.send(transaction);
});

//spend transaction route
app.post('/api/spend/:amount', (req, res) => {

    if(req.params.amount<0){
        res.status(400).send("Spend amount cannot be negative");
        return;
    }

    let total = req.params.amount;
    const map = new Map();
    const toRemove = [];
    //loop runs until end of remaining points array or total is 0
    for (var i = 0; i<remainingPoints.length && total>0; i++){
        var obj = remainingPoints[i];

        var toSpend = Math.min(total, obj.points);
        total = total-toSpend;
        obj.points = obj.points-toSpend;

        //if no points left, mark for removal
        if(obj.points == 0){
            toRemove.push(i);
        }

        if(!map.has(obj.payer)){
            map.set(obj.payer, 0-toSpend);
        }
        else{
            map.set(obj.payer, map.get(obj.payer)-toSpend);
        }
    }

    if(total > 0){
         res.status(400).send("Not enough points");
         return;
    }

    //removing 0 point values from array,
    //starting at end of array
    for(var i = toRemove.length - 1; i >=0; i--){
        remainingPoints.splice(toRemove[i],1);
    }

    //adding spend transactions to transaction list
    for (let [key, value] of map){

        const timestampJSON = new Date().toJSON();
        const transaction = {
            payer: key,
            points: value,
            timestamp: timestampJSON
        };

        transactions.push(transaction);
        transactions.sort(compare);
    }
    var toReturn = [];
    for (let [key, value] of map){

        const json = {
            payer: key,
            points: value
        }
        toReturn.push(json)
    }

    res.send(toReturn);
});


//return all payer point balances route
app.get('/api/balances', (req, res) => {

  var map = new Map();
  for (var i = 0; i < transactions.length; i++) {
      var obj = transactions[i];

        if(!map.has(obj.payer)){
             map.set(obj.payer, obj.points);
         }
         else{
             map.set(obj.payer, map.get(obj.payer)+obj.points);
         }
  }

    const json = JSON.stringify(Object.fromEntries(map));

    res.send(json);
});

//utility routes to view transactions and remaining points array
app.get('/api/transactions', (req, res) => {
    res.send(transactions);
});

app.get('/api/remaining', (req, res) => {
    res.send(remainingPoints);
});

app.listen(port, function () {
    console.log('Running on port: ' + port);
});