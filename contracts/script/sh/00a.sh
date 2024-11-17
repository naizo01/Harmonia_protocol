# .envファイルを読み込む
if [ -f .env ]; then
  export $(cat .env | xargs)
else
  echo ".envファイルが見つかりません。"
  exit 1
fi

# forge scriptコマンドを実行
forge script script/00_WhitelistHook.s.sol:WhitelistHookScript \
  --rpc-url $RPC_URL \
  --chain-id $CHAIN_ID \
  --private-key $PRIVATE_KEY \
  --broadcast \
  -vvvv
  # --priority-gas-price 1000000000000 \
  # --verifier-url $SCAN_URL \
  # --etherscan-api-key $SCAN_API_KEY \
  # --verify \