exports.models = {
    "SendAssetToAdress": {
        "id": "SendAssetToAdress",
        "required": ["address", "amount", "asset_id"],
        "properties": {
            "address": {
                "type": "string",       
                "address": "Address that will recive the asset"
            },
            "amount": {
                "type": "string",
                "description": "Represendts and amount of an asset"
            },
            "asset_id": {
                "type": "string",
                "description": "Id of the asset"
            }
        }
    }
}

