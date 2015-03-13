exports.models = {
    "CreatedAsset": {
        "id": "CreatedAsset",
        "required": ["txHex", "metadata", "assetId", "assetAddress"],
        "properties": {
            "txHex": {
                "type": "string",       
                "description": "hex of the issuence transaction to be signed and broadcasted"
            },
            "metadata": {
                "type": "string",
                "description": "url of where the asset metadat is hosted"
            },
            "assetId": {
                "type": "string",
                "description": "Id of the newly created asset"
            },
             "assetAdress": {
                "type": "string",
                "description": "Adress of the newly created asset"
            }
        }
    }
}

