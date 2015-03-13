var bitcoinjs = require('bitcoinjs-lib');
var base58check = require('bs58check');
var base58Address = "16UwLL9Risc3QfPqBUvKofHmBQ7wMtjvM";

 var addresshash = bitcoinjs.Address.fromBase58Check(base58Address).hash;
 console.log("adress");
 console.log(addresshash);
 var addresshash2 = new Buffer(addresshash.length +2);

 addresshash2[0] = 0x13;
 addresshash2[1] = 0x00;
 addresshash.copy(addresshash2,2);

  console.log("adress + namesapce and version");
 console.log(addresshash2);



 //base58check.encode(addresshash3)

 var crypto = require('crypto');
 var hash = sha256(sha256(addresshash2));
  console.log("adress");
    console.log("sha256 x2 of adress namespace and version:");
 console.log(hash);

   var addresshash3 = new Buffer(addresshash2.length +4);
   addresshash2.copy(addresshash3,0);
 hash.copy(addresshash3,addresshash2.length, 0,4);

   console.log("all buffers in one");
 console.log(addresshash3);

 console.log(base58check.encode(new Buffer("00010966776006953D5567439E5E39F86A0D273BEE852783AA")));
// bitcoinjs.scripts.pubKeyHashOutput(addresshash);

 console.log("--------------------------------");
 var hashwithout = bitcoinjs.scripts.pubKeyHashOutput(addresshash).getHash();
 var hashwithout2 = new Buffer(hashwithout.length +2);
 addresshash.copy(hashwithout2, 2);
 hashwithout2[0] = 0x13;
 hashwithout2[1] = 0x00;
 console.log(base58check.encode(hashwithout2));
 console.log(hashwithout2);
var hashwith = bitcoinjs.scripts.pubKeyHashOutput(addresshash).getHash();
 var hashwith2 = new Buffer(hashwith.length +2);
 addresshash.copy(hashwith, 2);
 hashwith[0] = 0x13;
 hashwith[1] = 0x00;
 console.log(base58check.encode(hashwith));


 var utils = require('./utils.js');
 console.log(utils.getAssetAddressId("mxNTyQ3WdFMQE7SGVpSQGXnSDevGMLq7dg"));

 function hash160(buffer) {
  return ripemd160(sha256(buffer))
}

function ripemd160(buffer) {
  return crypto.createHash('rmd160').update(buffer).digest()
}

function sha1(buffer) {
  return crypto.createHash('sha1').update(buffer).digest()
}

function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest()
}