class AdminsController < ApplicationController
    before_action :authenticate_user!
  
    def new
      @admin = User.new
    end
  
    def create
      @admin = User.new(admin_params)
      @admin.role = 'admin'
  
      if @admin.save
        redirect_to admins_path, notice: 'Admin created successfully.'
      else
        render :new
      end
    end
  
    private
    
    def admin_params
      params.require(:user).permit(:email, :password, :password_confirmation)
    end
  end
  