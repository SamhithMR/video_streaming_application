class Loan < ApplicationRecord
  belongs_to :user
  has_many :loan_adjustments, dependent: :destroy

  validates :amount, presence: true, numericality: { greater_than: 0 }
  validates :interest_rate, presence: true, numericality: { greater_than_or_equal_to: 0 }

  include AASM

  aasm column: 'state' do
    state :requested, initial: true
    state :approved
    state :open
    state :closed
    state :rejected
    state :waiting_for_adjustment_acceptance
    state :readjustment_requested

    event :approve do
      transitions from: :requested, to: :approved
    end

    event :reject do
      transitions from: [:requested, :waiting_for_adjustment_acceptance, :readjustment_requested], to: :rejected
    end

    event :confirm do
      transitions from: :approved, to: :open
    end

    event :close do
      transitions from: :open, to: :closed
    end

    event :adjust do
      transitions from: :requested, to: :waiting_for_adjustment_acceptance
    end

    event :readjust do
      transitions from: :waiting_for_adjustment_acceptance, to: :readjustment_requested
    end
  end
end
