exports.models = {
    "addressAndData": {
        "id": "addressAndData",
        "required": ["address", "data"],
        "properties": {
            "address": {
                "type": "string",
                "description": "Csend to address"
            },
            "data": {
                "type": "string",
                "description": "data to save"
            }
        }
    }
}