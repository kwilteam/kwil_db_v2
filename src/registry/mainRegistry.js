const axios = require("axios");

const createConnectorRegistry = () => {
    //const secret = _secret.slice()
    //const params = createRegistry(_credentials)
    const params = {
        url: 'https://registry.kwil.xyz',
        method: 'post',
        timeout: 20000,
        data: {

        }
    }
    class KwilDB {

        connectionParams = params

        addMoat = async (_moat, _owner,_apiKey,_secret) => {
            let _params = JSON.parse(JSON.stringify(params)) //we must copy the params since we will be writing to them

            //Putting a warning here, honestly for my sake more than anything else

            _params.data.moat = _moat
            _params.data.owner = _owner
            _params.data.apiKey = _apiKey
            _params.data.secret = _secret
            _params.url = _params.url + '/addMoat'
            const response = await axios(_params)
            return response.data
        }

        getMoats = async (_owner) => {
            let _params = JSON.parse(JSON.stringify(params)) //we must copy the params since we will be writing to them

            //Putting a warning here, honestly for my sake more than anything else

            _params.data.owner = _owner
            _params.url = _params.url + '/getMoats'
            const response = await axios(_params)
            return response.data
        }
    }
    return new KwilDB();
}

module.exports = createConnectorRegistry