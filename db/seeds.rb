# Clear existing data
LoanAdjustment.delete_all
Transaction.delete_all
Loan.delete_all
Wallet.delete_all
User.delete_all

# Create admin users
admin1 = User.create!(
  name: 'Admin One',
  email: 'admin1@example.com',
  password: 'password123',
  role: :admin
)

admin2 = User.create!(
  name: 'Admin Two',
  email: 'admin2@example.com',
  password: 'password123',
  role: :admin
)

# Create regular users
user1 = User.create!(
  name: 'User One',
  email: 'user1@example.com',
  password: 'password123',
  role: :user
)

user2 = User.create!(
  name: 'User Two',
  email: 'user2@example.com',
  password: 'password123',
  role: :user
)

# Create wallets for all users
admin1_wallet = Wallet.find_by(user: admin1) # Created automatically by `after_create`
admin2_wallet = Wallet.find_by(user: admin2)
user1_wallet = Wallet.find_by(user: user1)
user2_wallet = Wallet.find_by(user: user2)

# Set initial wallet balances
admin1_wallet.update!(balance: 100000)
admin2_wallet.update!(balance: 50000)
user1_wallet.update!(balance: 10000)
user2_wallet.update!(balance: 20000)

# Create loans
loan1 = Loan.create!(
  user: user1,
  admin_user: admin1,
  amount: 5000,
  interest_rate: 5.0,
  state: 'open'
)

loan2 = Loan.create!(
  user: user2,
  admin_user: admin2,
  amount: 8000,
  interest_rate: 7.0,
  state: 'open'
)

# Create loan adjustments
LoanAdjustment.create!(
  loan: loan1,
  adjusted_amount: 4500,
  adjusted_interest_rate: 4.5
)

LoanAdjustment.create!(
  loan: loan2,
  adjusted_amount: 7500,
  adjusted_interest_rate: 6.5
)

# Create transactions
Transaction.create!(
  wallet: admin1_wallet,
  user: admin1,
  amount: 5000,
  transaction_type: 'credit',
  description: 'Loan amount credited from User One'
)

Transaction.create!(
  wallet: user1_wallet,
  user: user1,
  amount: 5000,
  transaction_type: 'debit',
  description: 'Loan amount debited to Admin One'
)

Transaction.create!(
  wallet: admin2_wallet,
  user: admin2,
  amount: 8000,
  transaction_type: 'credit',
  description: 'Loan amount credited from User Two'
)

Transaction.create!(
  wallet: user2_wallet,
  user: user2,
  amount: 8000,
  transaction_type: 'debit',
  description: 'Loan amount debited to Admin Two'
)

puts "Seeding complete!"
