Rails.application.routes.draw do
  devise_for :users

  resources :loans do
    member do
      patch :approve
      patch :reject
      patch :adjust
      patch :accept_adjustment
      get :adjustment_form
      patch :repay
      patch :open
      patch :reject_approval
    end
    resources :loan_adjustments, only: [:create, :update]
  end

  root to: 'loans#index'

  resources :wallets, only: [:show] do
    resources :transactions, only: [:index]
  end
  
  get '/user', to: 'users#show'

  resources :loan_adjustment, only: [:new, :create] do
    member do
      patch :accept
      patch :reject
    end
  end

  

  resources :admins, only: [:new, :create]

  require 'sidekiq/web'
  mount Sidekiq::Web => '/sidekiq'
  
end
