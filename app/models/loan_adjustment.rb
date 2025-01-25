class LoanAdjustment < ApplicationRecord
  belongs_to :loan

  validates :adjusted_amount, numericality: { greater_than: 0 }, allow_nil: true
  validates :adjusted_interest_rate, numericality: { greater_than_or_equal_to: 0 }, allow_nil: true
end
