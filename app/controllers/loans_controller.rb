class LoansController < ApplicationController
    before_action :authenticate_user!
    before_action :set_loan, only: [:show, :update, :repay, :approve, :reject, :open, :reject_approval]
  
    def index
      if current_user.admin?
        @loans = Loan.includes(:user).all
        @loan_requests = Loan.where(state: "requested")
      else
        @loans = Loan.where(user: current_user)
      end
    end
    
  
    def show; end
  
    def new
      @loan = Loan.new
    end
  
    def create
      @loan = current_user.loans.build(loan_params)
      if @loan.save
        redirect_to @loan, notice: 'Loan request created successfully.'
      else
        render :new
      end
    end
  
    def update
      if params[:event]
        @loan.aasm.fire!(params[:event].to_sym)
        redirect_to @loan, notice: "Loan successfully updated to #{@loan.state}."
      else
        render :show, alert: 'Invalid state transition.'
      end
    end
  
    def repay
      if @loan.update(state: "closed")
        current_user.wallet.transfer_amount(@loan.amount, @loan.admin_user_id)
        redirect_to loans_path, notice: 'Loan repaid successfully.'
      else
        redirect_to loans_path, alert: 'Unable to repaly loan.'
      end
    end
   
    def approve
      if @loan.update(state: 'approved')
        current_user.wallet.transfer_amount(@loan.amount.to_f, @loan.user.id)
        @loan.admin_user_id = current_user.id
        @loan.save
        redirect_to loans_path, notice: 'Loan approved successfully.'
      else
        redirect_to loans_path, alert: 'Unable to approve loan.'
      end
    end

    def reject
      if @loan.update(state: 'rejected')
        @loan.admin_user_id = current_user.id
        @loan.save
        redirect_to loans_path, notice: 'Loan rejected successfully.'
      else
        redirect_to loans_path, alert: 'Unable to reject loan.'
      end
    end

    def reject_approval
      if @loan.update(state: "rejected")
        redirect_to loans_path, notice: 'Loan approved successfully.'
      else
        redirect_to loans_path, alert: 'Unable to approve loan.'
      end
    end

    def open
      if @loan.update(state: 'open')
        redirect_to loans_path, notice: 'Loan approved successfully.'
      else
        redirect_to loans_path, alert: 'Unable to approve loan.'
      end
    end

    def close
    end
  
    private
  
    def set_loan
      @loan = Loan.find(params[:id])
    end
  
    def loan_params
      params.require(:loan).permit(:amount, :interest_rate)
    end
  end
  