exports.models = {
    "SendAssetResponse": {
        "id": "SendAssetResponse",
        "required": ["txHex"],
        "properties": {
            "txHash": {
                "type": "string",       
                "address": "Hex of the transaction"
            }
        }
    }
}

