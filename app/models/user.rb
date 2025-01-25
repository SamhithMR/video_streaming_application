class User < ApplicationRecord
    enum :role, { user: 0, admin: 1, moderator: 2 }, prefix: true
  end
  