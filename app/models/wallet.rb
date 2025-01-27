class Wallet < ApplicationRecord
  belongs_to :user

  validates :balance, numericality: { greater_than_or_equal_to: 0 }

  def debit(amount)
    self.update(balance: balance - amount)
  end

  def credit(amount)
    self.update(balance: balance + amount)
  end

end
