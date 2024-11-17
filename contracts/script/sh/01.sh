# .envファイルを読み込む
if [ -f .env ]; then
  export $(cat .env | xargs)
else
  echo ".envファイルが見つかりません。"
  exit 1
fi

# forge scriptコマンドを実行
forge script script/01_CreatePoolAndMintLiquidity.s.sol:CreatePoolAndAddLiquidityScript \
  --rpc-url $RPC_URL \
  --chain-id $CHAIN_ID \
  --private-key $PRIVATE_KEY \
  --priority-gas-price 10000000000 \
  --broadcast \
  -vvvv
  # --verifier-url $SCAN_URL \
  # --etherscan-api-key $SCAN_API_KEY \
  # --verify  \