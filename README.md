# Notion Page Icon Manager

A React application for managing icons on Notion pages, specifically designed for pages of type "Nota" that are related to "Calendars GDeP" resources.

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Bootstrap](https://img.shields.io/badge/Bootstrap-563D7C?style=for-the-badge&logo=bootstrap&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)

## 🌟 Features

### 📋 Page Management
- View all Notion pages in a responsive grid layout
- Display page titles, descriptions, and current icons
- Show page types, labels, and resources as color-coded badges
- Direct links to Notion pages

### 🎯 Individual Page Actions
- **Remove Icon**: Remove an icon from a specific page
- **Set Calendar Icon**: Set a calendar emoji (🗓️) as the page's icon
- Individual action buttons on each page card

### 🔄 Bulk Operations
#### Remove All Icons
- Remove icons from multiple pages simultaneously
- Confirmation modal with list of affected pages
- Server-side filtering for security
- Progress feedback and completion summary

#### Set All Calendar Icons
- Set calendar emoji (🗓️) for multiple pages at once
- Preview affected pages in confirmation modal
- Skip pages that already have the calendar icon
- Detailed feedback on operation results

#### Create Monthly Pages
- Create 12 monthly pages for a year at once
- Each page automatically configured with:
  * Calendar emoji (🗓️) as icon
  * Type: "Nota"
  * Resource: Calendars GDeP
  * Label: "2026"
  * Status: "To do"
- Confirmation modal showing all properties
- Real-time progress feedback
- Automatic page list refresh after creation

### 💅 User Interface
- Clean, modern design with Bootstrap
- Responsive grid layout
- Enhanced loading states with spinners
- Context-aware loading messages
- Error handling with user-friendly messages
- Confirmation modals for bulk actions
- Bootstrap icons integration
- Color-coded badges for different properties

### 🔍 Properties Display
- **Types**: Multi-select field shown as primary badges
- **Labels**: Multi-select field with color-coded badges matching Notion colors
- **Resources**: Relation field shown as success badges
- **Status**: Select field integrated with page metadata

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)
- A Notion integration token
- Access to a Notion database

### Installation

1. Clone the repository:
   ```bash
   git clone [your-repository-url]
   cd [repository-name]
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory:
   ```env
   NOTION_API_KEY=your_notion_integration_token
   NOTION_DATABASE_ID=your_notion_database_id
   PORT=3000
   ```

4. Build the React application:
   ```bash
   npm run build
   ```

5. Start the server:
   ```bash
   node server.js
   ```

The application will be available at `http://localhost:3000`

## 🛠️ Development

### Running in Development Mode

1. Start the backend server:
   ```bash
   node server.js
   ```

2. In a separate terminal, start the React development server:
   ```bash
   npm start
   ```

### Project Structure
```
├── src/
│   ├── App.js           # Main React component
│   ├── App.css          # Styles
│   └── index.js         # React entry point
├── server.js            # Express backend server
├── package.json         # Dependencies and scripts
├── .env                 # Environment variables
└── README.md           # Documentation
```

## 🔒 Security Considerations
- Server-side filtering ensures only appropriate pages are modified
- Environment variables for sensitive data
- Input validation on both client and server
- Error handling for API failures

## 🔧 Configuration

### Environment Variables
- `NOTION_API_KEY`: Your Notion integration token
- `NOTION_DATABASE_ID`: ID of your Notion database
- `PORT`: Server port (default: 3000)

### Notion API Configuration
1. Create a Notion integration at https://www.notion.so/my-integrations
2. Share your database with the integration
3. Copy the integration token and database ID
4. Update your `.env` file with these values

## 📝 API Endpoints

### GET `/api/notion-pages`
- Retrieves all pages matching the filter criteria
- Returns page details including titles, icons, and metadata

### DELETE `/api/notion-pages/:pageId/icon`
- Removes the icon from a specific page
- Requires page ID as parameter

### PUT `/api/notion-pages/:pageId/icon`
- Updates the icon for a specific page
- Requires page ID and new icon in request body

### DELETE `/api/notion-pages/icons`
- Bulk removes icons from multiple pages
- Requires array of page IDs in request body

### PUT `/api/notion-pages/icons`
- Bulk updates icons for multiple pages
- Requires array of page IDs and new icon in request body

### POST `/api/notion-pages/bulk-create`
- Creates 12 monthly pages with predefined properties
- Automatically sets icon, type, resource, label, and status
- Returns created pages information and success status

## 🤝 Contributing
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments
- Built with [React](https://reactjs.org/)
- Styled with [Bootstrap](https://getbootstrap.com/)
- Icons from [Bootstrap Icons](https://icons.getbootstrap.com/)
- Powered by [Notion API](https://developers.notion.com/)
