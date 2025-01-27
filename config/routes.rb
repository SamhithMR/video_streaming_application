Rails.application.routes.draw do
  devise_for :users

  resources :loans do
    member do
      patch :approve
      patch :reject
      patch :adjust
      patch :accept_adjustment
      get :adjustment_form
    end
    resources :loan_adjustments, only: [:create, :update]
  end

  root to: 'loans#index'

  namespace :admin do
    resources :users, only: [:index, :show, :destroy]
    resources :loans, only: [:index, :show, :update]
  end

  get '/wallet/:id', to: 'wallets#show'
  get '/user', to: 'users#show'

  resources :loan_adjustment, only: [:new, :create] do
    member do
      patch :accept
      patch :reject
    end
  end
  
end
