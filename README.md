
# Diatoz Project

## Description

Loan management system where users can apply for loans, and admins can manage and approve them. The application integrates wallet functionality for users and admins, allowing for the transfer of loan amounts and interest payments. 

## Tech Stack

- **Ruby on Rails** - Web application framework
- **PostgreSQL** - Database management system
- **Sidekiq** - Background job processing
- **Redis** - In-memory data store, used with Sidekiq
- **Devise** - User authentication
- **TailwindCSS** - CSS framework for responsive design

## Installation

### Prerequisites

Make sure you have the following installed:
- Ruby 3.2.2
- Rails 8.0.1
- PostgreSQL
- Redis

### Steps to Install

1. **Clone the repository:**

   ```bash
   git clone git@github.com:SamhithMR/Diatoz.git
   cd diatoz
   ```

2. **Install Ruby dependencies:**

   ```bash
   bundle install
   ```

3. **Set up the database:**

   Make sure PostgreSQL is running, then run the following commands to set up your database:

   ```bash
   bin/rails db:create
   bin/rails db:migrate
   ```

4. **Run the Seed file:**

   It is **mandatory** to run the seed file to populate the database with initial data. This will create the first admin user, regular users, wallets, loans, and transactions.

   **Important:** Only the first admin can create other admins.

   Run the seed file:

   ```bash
   bin/rails db:seed
   ```

   - **First admin credentials:**
     - Name: Admin One
     - Email: admin1@example.com
     - Password: password123

5. **Configure Redis:**

   Make sure Redis is installed and running on your local machine. To start Redis:

   ```bash
   redis-server
   ```

6. **Start the Rails server:**

   To start the Rails server, run:

   ```bash
   bin/rails s
   ```

   Visit `http://localhost:3000` in your browser to access the app.

7. **Run Sidekiq (Background jobs):**

   To run Sidekiq, open a new terminal window and run:

   ```bash
   bundle exec sidekiq
   ```

   Sidekiq will now process background jobs such as loan interest calculations.

## Gem Dependencies

- **devise**: For authentication and user management.
- **pg**: PostgreSQL adapter for ActiveRecord.
- **sidekiq**: Background job processing.
- **redis**: Redis adapter for Sidekiq.
- **tailwindcss-rails**: Tailwind CSS integration with Rails.
- **active_model_serializers**: For JSON serialization.

## Database Configuration

Ensure that your `config/database.yml` file is correctly set up to connect to your PostgreSQL database.

Example for development environment:

```yaml
development:
  adapter: postgresql
  database: diatoz_development
  username: admin
  password: admin
  host: localhost
  port: 5432
```


Make sure to replace `username` and `password` with your actual PostgreSQL credentials.

## Admin Role Management

### Only the first admin can create additional admin users.

1. After running the seed file, log in with the **first admin** credentials (`admin1@example.com` and `password123`).
2. Once logged in, the first admin will have the option to create other admin users.

## Running the Application

1. Start the Rails server:

   ```bash
   bin/rails s
   ```

   This will start the application on `http://localhost:3000`.

2. Open another terminal window and run Sidekiq:

   ```bash
   bundle exec sidekiq
   ```

   Sidekiq will process the background jobs.

## Troubleshooting

- **Redis not running:** Make sure Redis is installed and running by executing `redis-server` in a separate terminal window.
- **Sidekiq not processing jobs:** Ensure Sidekiq is running by executing `bundle exec sidekiq` in a new terminal window.

## License

This project is open-source and available under the [MIT License](LICENSE).