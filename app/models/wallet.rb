class Wallet < ApplicationRecord
  belongs_to :user
  has_many :transactions, dependent: :destroy

  validates :balance, numericality: { greater_than_or_equal_to: 0 }

  def transfer_amount(amount, recipient_user_id)
    ActiveRecord::Base.transaction do
      raise StandardError, "Insufficient balance" if balance < amount

      recipient_wallet = Wallet.find_by(user_id: recipient_user_id)
      update!(balance: balance - amount)

      recipient_wallet.update!(balance: recipient_wallet.balance + amount)

      record_transaction(amount, recipient_wallet)
    end
  end

  private

  def record_transaction(amount, recipient_wallet)
    transactions.create!(
      user_id: user_id,
      amount: amount,
      transaction_type: "debit"
    )

    recipient_wallet.transactions.create!(
      user_id: recipient_wallet.user_id,
      amount: amount,
      transaction_type: "credit"
    )
  end
end
