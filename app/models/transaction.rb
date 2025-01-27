class Transaction < ApplicationRecord
  belongs_to :wallet
  belongs_to :user

  validates :amount, numericality: { greater_than_or_equal_to: 0 }
  validates :transaction_type, inclusion: { in: %w[debit credit] }
end
