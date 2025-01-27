class CalculateLoanInterestJob < ApplicationJob
  queue_as :default

  def perform(loan)
    interest = loan.amount * (loan.interest_rate / 100) * (5.0 / 60)
    loan.update(amount: loan.amount + interest)
  end
end
