class LoanAdjustmentController < ApplicationController
  before_action :set_loan, only: [:new, :create, :accept, :reject]
  before_action :set_adjustment, only: [:accept, :reject, :new, :create]

  def new
    @adjustments = LoanAdjustment.new
  end

  def show; end

  def create
    @adjustment = LoanAdjustment.new(adjustment_params)
    @adjustment.loan_id = @loan.id

    if @adjustment.save
      @loan.update(state: 'waiting_for_adjustment_acceptance')
      redirect_to loan_path(@loan), notice: 'Loan adjustment requested successfully.'
    end
  end

  def accept
    @loan.update(amount: @adjustment.adjusted_amount, interest_rate: @adjustment.adjusted_interest_rate)
    @loan.confirm!
    redirect_to loans_path, notice: 'Loan adjustment approved successfully.'
  end

  def reject
    @loan.reject!
    redirect_to loans_path, alert: 'Loan adjustment rejected.'
  end

  private

  def set_loan
    @loan = Loan.find(params[:id])
  end

  def set_adjustment
    if(params[:adjustment_id])
      @adjustment = LoanAdjustment.find(params[:adjustment_id])
    else
      @adjustment = @loan.loan_adjustments
    end
  end

  def adjustment_params
    params.permit(:adjusted_amount, :adjusted_interest_rate)
  end
end
