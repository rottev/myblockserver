exports.models = {
    "SendAsset": {
        "id": "SendAsset",
        "required": ["fees", "from", "to"],
        "properties": {
            "fees": {
                "type": "integer",       
                "description": "Fees for transaction in satoshi"
            },
            "from": {
                "type": "string",
                "description": "Adress to send the asset from"
            },
            "to": {
                "type": "array",
                "items": {
                    "$ref": "SendAssetToAdress"
                },
                "description": "Array of SendAssetToAdress items"
            }
        }
    }
}

