var bitcoinjs = require('bitcoinjs-lib');
var bitcore = require('bitcore-p2p');
var PeerManager = bitcore.PeerManager;
var utils = require('./utils.js');
var api = require('./api.js');
var Client = require('node-rest-client').Client;
var Q = require('q');

var args = {
    data: {
      "fees": 1000,
      "from": "bX8LMDZrr6jF66MbdYSYavPh1ZG6SMHkn2n",
      "to": [
        {
          "address": "bXAKLigwumi7SUvLYi1QM4Kb8MxUctSFoKa",
          "amount": "1",
          "asset_id": "oM3cne7pDtqsKcurPsey18V99ocwBWrPBT"
        }
      ]
   },
   headers: { "Content-Type": "application/json" } 
}

var client = new Client();

client.post("http://localhost:8080/v1/sendasset", args, function (data, response) {
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
        console.log(data);
        transactionObj = JSON.parse(data);
        console.log("****************************************");
        var tx = bitcoinjs.Transaction.fromHex(transactionObj.txHex);

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
        tx.sign(1, key)

        console.log(tx);

        // trybroadcast(tx);
        transactionObj.transactionHex = tx.toHex();

        console.log("Signed Tx Hex: " + transactionObj.transactionHex);
        console.log("---------------------------------");
        console.log(tx.getHash());

        deferred.resolve(transactionObj);

    }
    catch (e) {
        console.log("trySignTransactionbitcoinjs exeption " + e);
        console.log("trySignTransactionbitcoinjs exeption " + e.stack);
        deferred.reject(new Error("exeption " + e));
    }

    return deferred.promise;
}


function trybroadcast(tx)
{
    var peerman = new PeerManager({
      network: 'testnet'
    });

    conn = peerman.getActiveConnection();
     var pending = 1;
    peerman.on('ack', function listener() {
        if (!--pending) {
            peerman.removeListener('ack', listener);
            clearTimeout(timeout);
            print('Transaction sent to peer successfully.');
        }
    });

     print('Broadcasting transaction...');
     conn.sendTx(tx);

}


