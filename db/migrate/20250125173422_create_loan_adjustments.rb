class CreateLoanAdjustments < ActiveRecord::Migration[8.0]
  def change
    create_table :loan_adjustments do |t|
      t.references :loan, null: false, foreign_key: true
      t.decimal :adjusted_amount
      t.decimal :adjusted_interest_rate

      t.timestamps
    end
  end
end
