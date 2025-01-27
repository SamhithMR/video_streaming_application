class LoanInterestWorker
  include Sidekiq::Worker

  def perform
    loans = Loan.where(state: 'open')

    loans.each do |loan|
      interest = loan.amount * loan.interest_rate / 100
      total_amount = loan.amount + interest

      user_wallet = loan.user.wallet
      admin_wallet = loan.admin_user.wallet

      ActiveRecord::Base.transaction do
        if total_amount > user_wallet.balance
          remaining_balance = user_wallet.balance
          user_wallet.update!(balance: 0)
          admin_wallet.update!(balance: admin_wallet.balance + remaining_balance)

          record_transaction(user_wallet, admin_wallet, remaining_balance, loan.user.id, loan.admin_user.id, "Partial payment: Loan closed")
          loan.update!(state: 'closed')
        else
          user_wallet.update!(balance: user_wallet.balance - total_amount)
          admin_wallet.update!(balance: admin_wallet.balance + total_amount)

          record_transaction(user_wallet, admin_wallet, total_amount, loan.user.id, loan.admin_user.id, "Full payment: Loan closed")
        end

      end
    end
  end

  private

  def record_transaction(from_wallet, to_wallet, amount, user_id, admin_user_id, description)
    from_wallet.transactions.create!(
      user_id: user_id,
      amount: amount,
      transaction_type: "debit",
      description: description
    )

    to_wallet.transactions.create!(
      user_id: admin_user_id,
      amount: amount,
      transaction_type: "credit",
      description: description
    )
  end
end
