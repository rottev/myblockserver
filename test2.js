var bitcoinjs = require('bitcoinjs-lib');
var utils = require('./utils.js');
var api = require('./api.js');
var Client = require('node-rest-client').Client;
var Q = require('q');

var args = {
    data: {
      "issue_adress": "mxNTyQ3WdFMQE7SGVpSQGXnSDevGMLq7dg",
      "name": "test5 coins",
      "sort_name": "t5c",
      "amount": "1001",
      "fee": "1000",
      "selfhost": "false",
      "metadata": {
            "issuer": "me",
            "divisibility": "4",
            "icon_url": "null",
            "image_url": "null",
            "version": "string",
            "type": "1.0",
            "description": "yada"
      },
      "metadat_url": ""

   },
   headers: { "Content-Type": "application/json" }
    
}

var client = new Client();

client.post("http://localhost:8080/v1/issue", args, function (data, response) {
    // parsed response body as js object
    console.log(data);
    trySignTransactionBitcoinjs(data)
    .then(function (txobj) {
        console.log("************************brodcasting********************************");
        return api.broadcastRawTx(txobj.transactionHex, null);

    });
    // raw response
    //console.log(response);
});



var trySignTransactionBitcoinjs = function trySignTransactionBitcoinjs(data) {
    var deferred = Q.defer();
    try {
        dataobj = JSON.parse(data);
        transactionObj = JSON.parse(dataobj.tx.transaction);
        console.log("****************************************");
        console.log(transactionObj.raw);
        var tx = bitcoinjs.Transaction.fromHex(transactionObj.raw);

        console.log(tx);
        var txorig = tx.clone();
        tx.ins.forEach(function (input) {
            input.script = bitcoinjs.Script.EMPTY;
        });
        console.log(tx);
        // var txbuilder = bitcoinjs.TransactionBuilder.fromTransaction(tx);

        key = bitcoinjs.ECKey.fromWIF("L3nsAafxeMqi3tAs2fVijDZeG2grsFJmgKeMjAUrmxYUznZ8yfSx");

        // Sign the first input with the new key
        tx.sign(0, key)

        console.log(tx);
        dataobj.transactionHex = tx.toHex();

        console.log("Signed Tx Hex: " + dataobj.transactionHex);

        deferred.resolve(dataobj);

    }
    catch (e) {
        console.log("trySignTransactionbitcoinjs exeption " + e);
        console.log("trySignTransactionbitcoinjs exeption " + e.stack);
        deferred.reject(new Error("exeption " + e));
    }

    return deferred.promise;
}
