#!/bin/bash
script_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

sdk_directory=${1:-none}
if [ "none" = $sdk_directory ]; then
  echo "ERROR: Parameter sdk_directory is mandatory, and not given."
  exit 1
fi

mkdir -p ${sdk_directory}/out
cat ${sdk_directory}/apiGateway-js-sdk/apigClient.js > ${sdk_directory}/out/sdk.js
printf "\n" >> ${sdk_directory}/out/sdk.js 
cat ${sdk_directory}/apiGateway-js-sdk/lib/CryptoJS/rollups/* >> ${sdk_directory}/out/sdk.js 
printf "\n" >> ${sdk_directory}/out/sdk.js 
cat ${sdk_directory}/apiGateway-js-sdk/lib/CryptoJS/components/* >> ${sdk_directory}/out/sdk.js 
printf "\n" >> ${sdk_directory}/out/sdk.js 
cat ${sdk_directory}/apiGateway-js-sdk/lib/apiGatewayCore/* >> ${sdk_directory}/out/sdk.js 
printf "\n" >> ${sdk_directory}/out/sdk.js 
cat ${sdk_directory}/apiGateway-js-sdk/lib/axios/dist/axios.standalone.js >> ${sdk_directory}/out/sdk.js 
printf "\n" >> ${sdk_directory}/out/sdk.js 
cat ${sdk_directory}/apiGateway-js-sdk/lib/url-template/url-template.js >> ${sdk_directory}/out/sdk.js
printf "\nconst axios = module.exports;" >> ${sdk_directory}/out/sdk.js
printf "\nmodule.exports = apigClientFactory;" >> ${sdk_directory}/out/sdk.js
