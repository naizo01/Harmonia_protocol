# .envファイルを読み込む
if [ -f .env ]; then
  export $(cat .env | xargs)
else
  echo ".envファイルが見つかりません。"
  exit 1
fi

# forge scriptコマンドを実行
forge script script/00_test.s.sol:TestScript \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast \
  --chain-id $CHAIN_ID \
  --gas-estimate-multiplier 300 \
  --priority-gas-price 300000000 \
  -vvvv
  # --verifier-url $SCAN_URL \
  # --etherscan-api-key $SCAN_API_KEY \
  # --verify \