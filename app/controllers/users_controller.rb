class UsersController < ApplicationController

    def show
        @user = current_user
        @wallet = current_user.wallet
        @transactions = @wallet.transactions
    end

end
