const express = require('express');
const { Client } = require('@notionhq/client');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Initialize Notion client
const notion = new Client({
  auth: process.env.NOTION_API_KEY
});

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'build')));

app.get('/api/notion-pages', async (req, res) => {
  try {
    console.log('Fetching pages from Notion...');
    console.log('Database ID:', process.env.NOTION_DATABASE_ID);
    
    const response = await notion.databases.query({
      database_id: process.env.NOTION_DATABASE_ID,
      filter: {
        and: [
          {
            property: "Type",
            multi_select: {
              contains: "Nota"
            }
          },
          {
            property: "Resources",
            relation: {
              contains: "ddffe2a9-a7d8-4696-8ea9-3833bef50f59"
            }
          }
        ]
      }
    });

    console.log('Received response from Notion:', response.results.length, 'pages');

    const pages = response.results.map(page => ({
      id: page.id,
      title: page.properties.Name?.title[0]?.plain_text || 'Untitled',
      icon: page.icon,
      url: page.url,
      description: page.properties.Description?.rich_text[0]?.plain_text,
      types: page.properties.Type?.multi_select ? page.properties.Type.multi_select.map(ms => ms.name) : [],
      labels: page.properties.Label?.multi_select ? page.properties.Label.multi_select.map(ms => ({
        name: ms.name,
        color: ms.color
      })) : [],
      resources: page.properties.Resources?.relation?.map(rel => ({
        id: rel.id,
        name: "Calendars GDeP",
        color: "primary"
      })) || []
    }));

    console.log('Processed pages:', pages.length);
    res.json(pages);
  } catch (error) {
    console.error('Detailed error fetching pages:', {
      name: error.name,
      message: error.message,
      code: error.code,
      status: error.status
    });
    res.status(500).json({ 
      error: 'Failed to fetch pages',
      details: error.message 
    });
  }
});

app.delete('/api/notion-pages/:pageId/icon', async (req, res) => {
  try {
    const { pageId } = req.params;
    
    await notion.pages.update({
      page_id: pageId,
      icon: null
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error removing icon:', error);
    res.status(500).json({ error: 'Failed to remove icon' });
  }
});

app.delete('/api/notion-pages/icons', async (req, res) => {
  try {
    const { pageIds } = req.body;
    
    // First, query to get only the filtered pages
    const response = await notion.databases.query({
      database_id: process.env.NOTION_DATABASE_ID,
      filter: {
        and: [
          {
            property: "Type",
            multi_select: {
              contains: "Nota"
            }
          },
          {
            property: "Resources",
            relation: {
              contains: "ddffe2a9-a7d8-4696-8ea9-3833bef50f59"
            }
          }
        ]
      }
    });

    const filteredPageIds = response.results.map(page => page.id);
    const pageIdsToUpdate = pageIds.filter(id => filteredPageIds.includes(id));

    console.log(`Removing icons from ${pageIdsToUpdate.length} filtered pages out of ${pageIds.length} total pages`);

    const results = await Promise.all(
      pageIdsToUpdate.map(pageId => 
        notion.pages.update({
          page_id: pageId,
          icon: null
        })
      )
    );

    res.json({ 
      success: true, 
      count: results.length,
      totalRequested: pageIds.length,
      totalProcessed: pageIdsToUpdate.length 
    });
  } catch (error) {
    console.error('Error removing icons:', error);
    res.status(500).json({ error: 'Failed to remove icons' });
  }
});

app.put('/api/notion-pages/:pageId/icon', async (req, res) => {
  try {
    const { pageId } = req.params;
    const { icon } = req.body;
    
    await notion.pages.update({
      page_id: pageId,
      icon: {
        type: 'emoji',
        emoji: icon
      }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating icon:', error);
    res.status(500).json({ error: 'Failed to update icon' });
  }
});

app.put('/api/notion-pages/icons', async (req, res) => {
  try {
    const { pageIds, icon } = req.body;
    
    // First, query to get only the filtered pages
    const response = await notion.databases.query({
      database_id: process.env.NOTION_DATABASE_ID,
      filter: {
        and: [
          {
            property: "Type",
            multi_select: {
              contains: "Nota"
            }
          },
          {
            property: "Resources",
            relation: {
              contains: "ddffe2a9-a7d8-4696-8ea9-3833bef50f59"
            }
          }
        ]
      }
    });

    const filteredPageIds = response.results.map(page => page.id);
    const pageIdsToUpdate = pageIds.filter(id => filteredPageIds.includes(id));

    console.log(`Updating icons for ${pageIdsToUpdate.length} filtered pages out of ${pageIds.length} total pages`);

    const results = await Promise.all(
      pageIdsToUpdate.map(pageId => 
        notion.pages.update({
          page_id: pageId,
          icon: {
            type: 'emoji',
            emoji: icon
          }
        })
      )
    );

    res.json({ 
      success: true, 
      count: results.length,
      totalRequested: pageIds.length,
      totalProcessed: pageIdsToUpdate.length 
    });
  } catch (error) {
    console.error('Error updating icons:', error);
    res.status(500).json({ error: 'Failed to update icons' });
  }
});

app.post('/api/notion-pages/bulk-create', async (req, res) => {
  try {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const results = await Promise.all(
      months.map(async (month) => {
        return notion.pages.create({
          parent: {
            database_id: process.env.NOTION_DATABASE_ID
          },
          icon: {
            type: 'emoji',
            emoji: '🗓️'
          },
          properties: {
            Name: {
              title: [
                {
                  text: {
                    content: `${month} 2026`
                  }
                }
              ]
            },
            Type: {
              multi_select: [
                {
                  name: "Nota"
                }
              ]
            },
            Resources: {
              relation: [
                {
                  id: "ddffe2a9-a7d8-4696-8ea9-3833bef50f59"
                }
              ]
            },
            Label: {
              multi_select: [
                {
                  name: "2026"
                }
              ]
            },
            Status: {
              select: {
                name: "To do"
              }
            }
          }
        });
      })
    );

    res.json({ 
      success: true,
      count: results.length,
      pages: results.map(page => ({
        id: page.id,
        title: page.properties.Name.title[0].plain_text
      }))
    });
  } catch (error) {
    console.error('Error creating pages:', error);
    res.status(500).json({ 
      error: 'Failed to create pages',
      details: error.message 
    });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log('Environment variables:');
  console.log('- NOTION_API_KEY:', process.env.NOTION_API_KEY ? 'Set' : 'Not set');
  console.log('- NOTION_DATABASE_ID:', process.env.NOTION_DATABASE_ID ? 'Set' : 'Not set');
});
