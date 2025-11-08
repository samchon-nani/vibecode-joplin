# Hospital Price Comparison Tool

A Next.js application that helps users compare hospital prices for medical procedures within a specified radius. Users can search by procedure type, location, insurance provider, and distance range to find the best pricing options.

## Features

- 🔍 Search for medical procedures by location (city, state, or zip code)
- 📍 Filter hospitals by distance radius (in miles)
- 🏥 Compare prices with and without insurance
- ✅ See which hospitals are in-network for your insurance
- 💰 View cost savings when using insurance
- 📊 Sort results by distance or price
- 🎨 Modern, responsive UI

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. **Select a Procedure**: Choose from available medical procedures (MRI, CT Scan, X-Ray, Blood Test, Ultrasound)

2. **Enter Location**: Type a city and state (e.g., "Beverly Hills, CA") or a zip code (e.g., "90210")

3. **Select Insurance** (Optional): Choose your insurance provider to see in-network pricing, or leave blank to see all options

4. **Set Distance Range**: Enter the maximum distance in miles you're willing to travel

5. **Search**: Click "Search Hospitals" to see results

## Example Search

- **Procedure**: MRI
- **Location**: Beverly Hills, CA (or 90210)
- **Insurance**: BlueCross BlueShield
- **Distance**: 100 miles

The results will show:
- All hospitals within 100 miles
- Distance from your location
- In-network status
- Price with insurance (if in-network)
- Price without insurance
- Cost savings with insurance

## Data Structure

The application uses JSON files for data storage:

- `data/hospitals.json` - Hospital information, locations, and pricing
- `data/insurances.json` - Insurance provider information
- `data/procedures.json` - Available medical procedures
- `data/zipCodes.json` - Zip code to coordinates mapping

## Project Structure

```
├── app/
│   ├── api/
│   │   └── search/
│   │       └── route.ts      # API endpoint for search
│   ├── globals.css            # Global styles
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Main page
├── components/
│   ├── SearchForm.tsx         # Search form component
│   ├── ResultsList.tsx        # Results list with sorting
│   └── HospitalCard.tsx       # Individual hospital card
├── data/
│   ├── hospitals.json         # Hospital data
│   ├── insurances.json        # Insurance data
│   ├── procedures.json        # Procedure data
│   └── zipCodes.json          # Zip code coordinates
└── lib/
    ├── utils.ts               # Utility functions (distance calculation)
    └── types.ts               # TypeScript type definitions
```

## Technologies Used

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **JSON** - Data storage
- **Haversine Formula** - Distance calculation between coordinates

## Notes

- This is a hackathon project with **fake data** for demonstration purposes
- Location parsing is simplified - in production, you'd use a geocoding API
- The data includes 10 hospitals in California for demo purposes
- All pricing is simulated and not based on real hospital data

## Future Enhancements

- Integration with real geocoding API
- Real hospital pricing data
- Map visualization of hospitals
- User reviews and ratings
- Appointment booking integration
- More detailed procedure information
- Cost estimator for multiple procedures

