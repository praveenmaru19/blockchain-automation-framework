var express = require('express')
  , router = express.Router();

const {productContract, fromAddress} = require('../web3services');
var multer = require('multer'); // v1.0.5
var upload = multer(); // for parsing multipart/form-data
var bodyParser = require('body-parser');

router.use(bodyParser.json()); // for parsing application/json

router.get('/containerless', function (req,res){
  // TODO: Get products not assigned to a container
  // getContainerlessProducts()
  // .then( response => {
  //   res.send(response)
  // })
  // .catch(error => {
  //   console.log(error)
  //   res.send("error")
  // })
})

//GET product with or without trackingID
// Get single product
router.get('/:trackingID?', function (req, res) {
  if (req.params.trackingID != null) {
    const trackingID = req.params.trackingID;
    console.log(trackingID, "***");
    productContract.methods
      .getSingleProduct(req.params.trackingID)
      .send({ from: fromAddress, gas: 6721975, gasPrice: "30000000" })
      .then(response => {
        res.send(response);
      })
      .catch(error => {
        console.log(error);
        res.send("error");
      });
  }else {
    // TODO: Get all products
    productContract.methods
    .getAllProducts()
    .send({ from: fromAddress, gas: 6721975, gasPrice: "30000000"})
    .then(response => {
      console.log(response);
      if(Object.keys(response.events).length !== 0 && response.events.sendArray){
        res.send(response.events.sendArray.returnValues[0]);
      }
    
    })
    .catch(err => {
    console.log(err);
    })
  }
})

//POST for new product
router.post('/',upload.array(),function(req,res) {
  res.setTimeout(15000);
  // TODO: Create product
  let newProduct = {
    productName: req.body.productName,
    misc: { name: req.body.misc.name },
    trackingID: req.body.trackingID,
    counterparties: req.body.counterparties
  };

  productContract.methods
    .addProduct(
      newProduct.productName,
      "health",
      JSON.stringify(newProduct.misc),
      newProduct.trackingID,
      ""
    )
    .send({ from: fromAddress, gas: 6721975, gasPrice: "30000000" })
    .on("receipt", function(receipt) {
      // receipt example
      console.log(receipt);
      if (receipt.status === true) {
        console.log(
          "#####",
          receipt
        );
        if(receipt.events.length !== null && receipt.events.sendProduct.returnValues[0]) res.send(receipt.events.sendProduct.returnValues[0]);
        else res.send(receipt);
      }
      if (receipt.status === false) {
        console.log("Request error");
        res.send("Transaction not successful");
      }
    })
    .on("error", function(error) {
      res.send("Error! "+ error);
      console.log("error" + JSON.stringify(error, null, 4));
      console.log(error);
    });
})

//PUT for changing custodian
router.put('/:trackingID/custodian', function(req,res) {
  res.setTimeout(15000);
  // TODO: Implement change custodian functionality
  var trackingID = req.params.trackingID;
  console.log(trackingID);
    productContract.methods
      .updateCustodian(trackingID)
      .send({ from: fromAddress, gas: 6721975, gasPrice: "30000000" })
      .then( response => {
        res.send(response)
      })
      .catch(error => {
        console.log(error)
        res.send(error.message)
      })
});

module.exports = router
