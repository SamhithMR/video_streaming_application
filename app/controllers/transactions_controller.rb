class TransactionsController < ApplicationController
    def index
      @wallet = Wallet.find(params[:wallet_id])
      @transactions = @wallet.transactions
    end
end
  