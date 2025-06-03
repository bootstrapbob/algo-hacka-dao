# HackathonDAO

A decentralized autonomous organization (DAO) for hackathon teams built on the Algorand blockchain. This application allows hackathon teams to join, create proposals, vote, and manage team funds in a decentralized way.

## Features

- Simple, non-crypto-focused user experience
- Pera Wallet integration for easy transaction signing
- Two membership tiers: Basic Member and Team Lead
- Proposal creation and voting system
- Treasury management for fund allocation
- Real-time updates for proposal status

## Tech Stack

- React with TypeScript
- Tailwind CSS for styling
- Algorand blockchain
- Pera Wallet for authentication
- Zustand for state management

## Project Structure

```
HackathonDAO/
├── public/                # Static assets
├── src/
│   ├── components/        # React components
│   ├── store/             # State management (Zustand)
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions
│   ├── App.tsx            # Main application component
│   └── main.tsx           # Application entry point
├── package.json           # Project dependencies
└── README.md              # Project documentation
```

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm run dev
   ```

## Deployment

### Testnet Deployment

To deploy the DAO on Algorand Testnet:

1. Update the `APP_ID` constant in `src/utils/algorand.ts` with your deployed smart contract ID
2. Build the application:
   ```
   npm run build
   ```
3. Deploy the built files to your preferred hosting service

### Mainnet Deployment

For production deployment on Algorand Mainnet:

1. Update the Algorand client configuration in `src/utils/algorand.ts` to use Mainnet
2. Update the `APP_ID` constant with your Mainnet smart contract ID
3. Build and deploy the application

## License

MIT