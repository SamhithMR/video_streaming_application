class AddAdminUserToLoans < ActiveRecord::Migration[8.0]
  def change
    add_reference :loans, :admin_user, foreign_key: { to_table: :users }, null: true
  end
end
