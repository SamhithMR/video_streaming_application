class User < ApplicationRecord
  
  devise :database_authenticatable, :registerable, :recoverable, :rememberable, :validatable
  has_one :wallet, dependent: :destroy
  has_many :loans, dependent: :destroy

  has_many :issued_loans, class_name: 'Loan', foreign_key: 'admin_user_id'

  enum :role, { user: 0, admin: 1}, prefix: true

  validates :email, presence: true, uniqueness: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  
  after_create :create_wallet_with_initial_balance

  def admin?
    self.role == "admin"
  end

  private

  def create_wallet_with_initial_balance
    initial_balance = role == 0 ? 1_000_000 : 10_000
    create_wallet(balance: initial_balance)
  end

end