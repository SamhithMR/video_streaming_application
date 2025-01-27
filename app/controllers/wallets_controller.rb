class WalletsController < ApplicationController
    before_action :set_wallet, only: [:show]
  
    def show
      @wallet = current_user.wallet
      @transactions = @wallet.transactions
    end
  
    private
  
    def set_wallet
      @wallet = Wallet.find(params[:id])
    end
  end
  