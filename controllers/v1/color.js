module.exports = (function () {
    var api = require('../../api.js');
    var google = require('../../googleapi.js');
    var sw = require("swagger-node-express");
    var utils = require('../../utils.js');
    var config = require('../../config.js');
    var redis = require('redis');
    var Q = require("q");


    function color() { };

    console.log("loading color")

    color.registerRoutes = function registerRoutes(app, path, swagger) {
     
         //endpoint to issue an asset
        var getAddress = {
            'spec': {
                "description": "",
                "path": "/coloraddress",
                "notes": "Returns a colored adress for the normal address given",
                "summary": "",
                "method": "POST",
                "parameters": [
                        sw.bodyParam("AddressIn", "Asset Issue Object", "AddressIn")
                ],
                "type": "string",
                "errorResponses": [swagger.errors.notFound('address')],
                "nickname": "getAddress"
            },
            'action': function (req, res) {
                console.log("get address action");
                tryGetAddress(req, res);
            }
        };

        swagger.addPost(getAddress);


        //endpoint to issue an asset
        var issueAsset = {
            'spec': {
                "description": "",
                "path": "/issue",
                "notes": "Returns a issued asset",
                "summary": "",
                "method": "POST",
                "parameters": [
                        sw.bodyParam("AssetDefinition", "Asset Issue Object", "AssetDefinition")
                ],
                "type": "CreatedAsset",
                "errorResponses": [swagger.errors.notFound('asset')],
                "nickname": "issueAsset"
            },
            'action': function (req, res) {
                console.log("issue action");
                tryIssueAsset(req, res);
            }
        };

        swagger.addPost(issueAsset);

        //endpoint to send an asset
         var sendAsset = {
            'spec': {
                "description": "",
                "path": "/sendasset",
                "notes": "Returns a issued asset",
                "summary": "",
                "method": "POST",
                "parameters": [
                        sw.bodyParam("SendAsset", "Asset Send Object", "SendAsset")
                ],
                "type": "SendAssetResponse",
                "errorResponses": [swagger.errors.notFound('asset')],
                "nickname": "sendAsset"
            },
            'action': function (req, res) {
                console.log("send asset action");
                trySendAsset(req, res);
            }
        };

        swagger.addPost(sendAsset);

        //endpoint to get asset metadata
        var getAsset = {
            'spec': {
                "description": "",
                "path": "/asset/{assetId}",
                "notes": "Returns information about an asset",
                "summary": "",
                "method": "GET",
                "parameters": [sw.pathParam("assetId", "ID of Asset we want to get info for", "string")],
                "type": "Asset",
                "errorResponses": [swagger.errors.notFound('asset')],
                "nickname": "getAsset"
            },
            'action': function (req, res) {
                res.send(api.getAssetDefeintion(req.params.assetId));
            }
        };

        swagger.addGet(getAsset);

        // endpoint to get all adresses holding an asset
         var getHoldingAdressesForAsset = {
            'spec': {
                "description": "",
                "path": "/stakeholders/{assetId}/{blockheight}?",
                "notes": "Returns a all adresses holding the asset",
                "summary": "",
                "method": "GET",
                "parameters": [
                        sw.pathParam("assetId", "ID of Asset we want to get info for", "string"),
                        sw.pathParam("blockheight", "block hieght to consider (optional)", "integer", false)
                ],
                "type": "AssetHolders",
                "errorResponses": [swagger.errors.notFound('asset')],
                "nickname": "getStakeholders"
            },
            'action': function (req, res) {
                console.log("get stakeholders action");
                trygetAssetStakeholders(req, res);
            }
        };

        swagger.addGet(getHoldingAdressesForAsset);


        console.log("color routes added.");


    }

    /**
     * @api {get} /asset/:id Request User information
     * @apiName GetAssetMetadata
     * @apiGroup Color
     *
     * @apiParam {Number} id Asset unique ID.
     *
     * @apiSuccess {Object} AssetMetadata asset metadata.
     * 
     */
    function  tryGetAddress(req, res){
        try{
            var adder = utils.getAssetAddressId(req.body.address);
            client = redis.createClient();
            client.hmset("addresses", req.body.address, req.body.email, function(err, data){
                console.log(data);
            });
             res.json({adress: adder});
        }
        catch(e) {
             res.status(500).send({ error: e.message });
        }
    }

    function tryIssueAsset(req, res) {
        console.log("issueAsset")
        getOpenAssetsItem(req.body)
        .then(function (item) {
            api.createAsset(item)
            .then(function (data) {
                console.log("createAsset success");
                var transaction = returnIssuedAsset(data);
                transaction.assetid = utils.getAssetId(req.body.issue_adress);
                newAssetResponseFromOpenAssets(transaction, function (response, error) {
                    if (error)
                        res.status(500).send({ error: error.message });
                    else
                        res.json(response);
                });
            },
            function (error) {
                console.log("createAsset failed");
                res.send({ error: error });
            });
        }).catch(function (error) {
            console.log(error)
            res.json(error);
        });

    }



    function trySendAsset(req, res) {
        try{
            api.sendAsset(req.body)
             .then(function(data){
                 res.json({ txHex: data.raw});
            })
            .catch(function(error){
                 res.status(500).send({ error: error.message });
            });  
        }
        catch(e) {
             res.status(500).send({ error: e.message });
        }
    }

    function trygetAssetStakeholders(req, res) {
        try{
            api.getAssetStakeholders(req.params.assetId, req.params.blockheight)
            .then(function(data){
                 res.json(data);
            })
            .catch(function(error){
                 res.status(500).send({ error: error.message });
            });  
        }
        catch(e) {
             res.status(500).send({ error: e.message });
        }
    }

    function newAssetResponseFromOpenAssets(newAsset, callback) {
        try {
            var hex = JSON.parse(newAsset.transaction);
            var resp = {
                txHex: hex.raw,
                metadata: newAsset.asset.metadata,
                assetId: newAsset.assetid,
                assetAdress: newAsset.asset.address
            }
            callback(resp, null);
        }
        catch (e) {
            console.log(e);
            callback(null, e);
        }
    }

    function getOpenAssetsItem(AssetDefinition) {
        var deferred = Q.defer();
        if (AssetDefinition.selfhost) {
            var openAsset = {
                fees: AssetDefinition.fee,
                from: AssetDefinition.issue_adress,
                address: utils.getAssetAddressId(AssetDefinition.issue_adress),
                amount: AssetDefinition.amount,
                metadata: "u=" + AssetDefinition.metadat_url
            };
            deferred.resolve(openAsset);
        }
        else {
            hostMetadataFile(AssetDefinition)
            .then(function (url) {
                var openAsset = {
                    fees: AssetDefinition.fee,
                    from: AssetDefinition.issue_adress,
                    address: utils.getAssetAddressId(AssetDefinition.issue_adress),
                    amount: AssetDefinition.amount,
                    metadata: "u=" + url
                }
                deferred.resolve(openAsset);
            },
            function (error) {
                console.log(error);
                deferred.reject(new Error("error code was " + error));
            });

        }

        return deferred.promise;
        /*
        AssetDefinition.issue_adress
        AssetDefinition.name
        AssetDefinition.sort_name
        AssetDefinition.amount
        AssetDefinition.fee
        AssetDefinition.selfhost
        AssetDefinition.metadata.issuer
        AssetDefinition.metadata.divisibility
        AssetDefinition.metadata.icon_url
        AssetDefinition.metadata.image_url
        AssetDefinition.metadata.version
        AssetDefinition.metadata.type
        AssetDefinition.metadat_url
        */
    }

    function hostMetadataFile(AssetDefinition) {
        var deferred = Q.defer();

        var longurl = generateLocalMetadataPath(AssetDefinition);
        google.getShortUrl(longurl)
        .then(function (url) {
            AssetDefinition.contract_url = url;
            utils.createMetadata(AssetDefinition);
            deferred.resolve(url);
        },
        function (error) {
            deferred.reject(new Error("Status code was " + response.statusCode));
        });

        AssetDefinition.contract_url;

        return deferred.promise;
    }

    function generateLocalMetadataPath(AssetDefinition) {
        var path = config.machineurl + "/metadata/" + AssetDefinition.sort_name;
        return path;
    }

    function returnIssuedAsset(transaction) {
        return transaction;
    }

    return color;
})();