# .envファイルを読み込む
if [ -f .env ]; then
  export $(cat .env | xargs)
else
  echo ".envファイルが見つかりません。"
  exit 1
fi

# forge scriptコマンドを実行
forge script script/00_SP.s.sol:spScript \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast \
  --chain-id $CHAIN_ID \
  --priority-gas-price 10000000000 \
  -vvvv
  # --verifier-url $SCAN_URL \
  # --etherscan-api-key $SCAN_API_KEY \
  # --verify \