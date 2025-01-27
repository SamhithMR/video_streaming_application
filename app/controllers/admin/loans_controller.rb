class Admin::LoansController < Admin::BaseController
    # before_action :authenticate_user!
    def index
      @loans = Loan.all
    end
  end
  