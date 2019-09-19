#!/bin/bash
script_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
project_dir="${script_dir}/.."

vehicle_api_id=${1:-none}
if [ "none" = $vehicle_api_id ]; then
  echo "ERROR: Parameter vehicle_api_id is mandatory, and not given."
  exit 1
fi

echo "INFO: Downloading Vehicle SDK"
aws apigateway get-sdk --rest-api-id ${vehicle_api_id} --stage-name prod --sdk-type javascript $project_dir/lib/vehicle-api/sdk.zip
cd $project_dir/lib/vehicle-api
unzip sdk.zip

echo "INFO: Adapting SDKs to app"
bash $script_dir/build-sdk.sh $project_dir/lib/vehicle-api

echo "INFO: Linking repository to sdks"
cd $project_dir/lib/vehicle-api && npm link

echo "INFO: SDKs successfully included"
