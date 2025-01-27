class RemoveDefaultFromAdminUserInLoans < ActiveRecord::Migration[6.1]
  def change
    change_column_default :loans, :admin_user_id, nil
  end
end
