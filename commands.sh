## To Bring up the Network
source .env
docker-compose up -d


## To Start a Chaincode
export FABRIC_CFG_PATH=$(pwd)/sampleconfig
CORE_PEER_TLS_ENABLED=false CORE_CHAINCODE_LOGLEVEL=debug  node_modules/.bin/fabric-chaincode-node start --peer.address=127.0.0.1:7052 --chaincode-id-name=mycc:1.0


## Committing a chaincode to network
export FABRIC_CFG_PATH=$(pwd)/sampleconfig
peer lifecycle chaincode approveformyorg  -o 127.0.0.1:7050 --channelID ch1 --name mycc --version 1.0 --sequence 1 --init-required --signature-policy "OR ('SampleOrg.member')" --package-id mycc:1.0
peer lifecycle chaincode checkcommitreadiness -o 127.0.0.1:7050 --channelID ch1 --name mycc --version 1.0 --sequence 1 --init-required --signature-policy "OR ('SampleOrg.member')"
peer lifecycle chaincode commit -o 127.0.0.1:7050 --channelID ch1 --name mycc --version 1.0 --sequence 1 --init-required --signature-policy "OR ('SampleOrg.member')" --peerAddresses 127.0.0.1:7051


## To Query a Chaincode
export FABRIC_CFG_PATH=$(pwd)/sampleconfig
CORE_PEER_ADDRESS=127.0.0.1:7051 peer chaincode invoke -o 127.0.0.1:7050 -C ch1 -n mycc -c '{"Function":"getByRangeWithPagination","Args":["k1","","3",""]}'


## To Bring Down the Network
docker-compose down
