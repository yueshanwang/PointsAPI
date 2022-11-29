const express = require('express');
const app = express();
app.use(express.json());

var port = process.env.PORT || 4000;

// insert elements in order of timestamp
//timestamp should sort normally
var transactions = [

    {payer: "payer1", points: 300, timestamp:"2022-10-31T10:00:00Z"},
    {payer: "payer2", points: 300, timestamp:"2022-10-31T10:00:00Z"},
    {payer: "payer3", points: 10000, timestamp: "2022-10-31T11:00:00Z" },
    {payer: "payer1", points: 1000, timestamp:"2022-10-31T10:00:00Z"}
]

function compare(a,b) {

    if (a.timestamp < b.timestamp){
        return -1;
    }
    if (a.timestamp > b.timestamp){
        return 1;
     }
    return 0;
}

//go through list of add transactions and minus payers' points from the spend points sum

app.get('/', (req, res) => {

    res.send('Welcome to Yueshan\'s web service');

});

//view transactions list
app.get('/api/transactions', (req, res) => {

    res.send(transactions);

});

//add transaction route
app.put("/api/add", (req, res) =>{

    if(!req.body){
     res.status(400).send("no body in request");
     return;
    }

    if (!req.body.payer || req.body.payer.length < 3){
    
        res.status(400).send("bad name");
        return;
    }

    var timestampJSON = req.body.timestamp;

    if(!timestampJSON){
        timestampJSON = new Date().toJSON();
    }

  const transaction = {
    payer: req.body.payer,
    points: req.body.points,
    timestamp: timestampJSON
  };

  transactions.push(transaction);
  transactions.sort(compare);
  res.send(transaction);

});


//spend transaction route
app.post('/api/spend/:amount', (req, res) => {

    let total = req.params.amount;
    const toRemove=[];
    const map = new Map();
    for (var i = 0; i<transactions.length && total>0; i++){
        var obj = transactions[i];

        var toSpend = Math.min(total, obj.points);

        total = total-toSpend;

        obj.points = obj.points-toSpend;

        if(!map.has(obj.payer)){

            map.set(obj.payer, 0-toSpend);
        }
        else{
            map.set(obj.payer, map.get(obj.payer)-toSpend);
        }
    }

    const values = Array.from(map);

    res.send(values);
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

app.listen(port, function () {
    console.log('Running on port: ' + port);
});