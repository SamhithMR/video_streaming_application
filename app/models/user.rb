class User < ApplicationRecord
  has_one :wallet, dependent: :destroy
  has_many :loans, dependent: :destroy

  enum :role, { user: 0, admin: 1}, prefix: true

  validates :name, presence: true
  validates :email, presence: true, uniqueness: true, format: { with: URI::MailTo::EMAIL_REGEXP }

  after_create :set_initial_wallet_balance

  private

  def set_initial_wallet_balance
    initial_balance = role == 0 ? 1_000_000 : 10_000
    wallet.update!(balance: initial_balance)
  end

end