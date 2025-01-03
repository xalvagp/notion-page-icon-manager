import React, { useState, useEffect, useCallback, memo } from 'react';
import { Container, Row, Col, Card, Button, Badge, Modal, ListGroup } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';

// Memoized PageCard component to prevent unnecessary re-renders
const PageCard = memo(({ page, onRemoveIcon, onSetCalendarIcon }) => (
  <Col key={page.id}>
    <Card className="h-100 shadow-sm">
      <Card.Body>
        <div className="d-flex align-items-center justify-content-between mb-2">
          <div className="d-flex align-items-center">
            {page.icon?.type === 'emoji' && (
              <span className="me-2" style={{ fontSize: '1.2em' }}>
                {page.icon.emoji}
              </span>
            )}
            <Card.Title className="mb-0">
              <a href={page.url} target="_blank" rel="noopener noreferrer" 
                 className="text-decoration-none">
                {page.title}
              </a>
            </Card.Title>
          </div>
          <div className="d-flex gap-2">
            <Button 
              variant="outline-primary" 
              size="sm"
              onClick={() => onSetCalendarIcon(page.id)}
            >
              🗓️
            </Button>
            {page.icon && (
              <Button 
                variant="outline-danger" 
                size="sm"
                onClick={() => onRemoveIcon(page.id)}
              >
                Remove Icon
              </Button>
            )}
          </div>
        </div>

        {page.description && (
          <Card.Text className="text-muted small">
            {page.description}
          </Card.Text>
        )}

        <div className="mt-2">
          {page.types?.map(type => (
            <Badge key={type} bg="primary" className="me-1">
              {type}
            </Badge>
          ))}
        </div>

        {page.resources && page.resources.length > 0 && (
          <div className="mt-2">
            {page.resources.map(resource => (
              <Badge 
                key={resource.id}
                bg={resource.color === 'primary' ? 'success' : 'secondary'}
                className="me-1"
              >
                {resource.name}
              </Badge>
            ))}
          </div>
        )}
      </Card.Body>
    </Card>
  </Col>
));

function App() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [pagesToModify, setPagesToModify] = useState([]);
  const [pagesToRemoveIcons, setPagesToRemoveIcons] = useState([]);

  const fetchPages = useCallback(async () => {
    try {
      const response = await fetch('/api/notion-pages');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Server error: ${errorData.error} - ${errorData.details || ''}`);
      }
      const data = await response.json();
      setPages(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching pages:', err);
      setError(err.message);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  const removeIcon = useCallback(async (pageId) => {
    try {
      const response = await fetch(`/api/notion-pages/${pageId}/icon`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setPages(pages => pages.map(page => 
          page.id === pageId 
            ? { ...page, icon: null }
            : page
        ));
      } else {
        throw new Error('Failed to remove icon');
      }
    } catch (err) {
      console.error('Error removing icon:', err);
      alert('Failed to remove icon');
    }
  }, []);

  const setCalendarIcon = useCallback(async (pageId) => {
    try {
      const response = await fetch(`/api/notion-pages/${pageId}/icon`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ icon: '🗓️' })
      });
      
      if (response.ok) {
        setPages(pages => pages.map(page => 
          page.id === pageId 
            ? { ...page, icon: { type: 'emoji', emoji: '🗓️' } }
            : page
        ));
      } else {
        throw new Error('Failed to update icon');
      }
    } catch (err) {
      console.error('Error updating icon:', err);
      alert('Failed to update icon');
    }
  }, []);

  const handleRemoveAllIconsClick = useCallback(() => {
    const pagesWithIcons = pages.filter(page => page.icon);
    if (pagesWithIcons.length === 0) {
      alert('No pages with icons found');
      return;
    }
    setPagesToRemoveIcons(pagesWithIcons);
    setShowConfirmModal(true);
  }, [pages]);

  const handleConfirmRemoveAllIcons = useCallback(async () => {
    if (isRemoving) return;

    try {
      setIsRemoving(true);
      const pageIds = pagesToRemoveIcons.map(page => page.id);

      const response = await fetch('/api/notion-pages/icons', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pageIds })
      });
      
      if (response.ok) {
        const result = await response.json();
        setPages(pages => pages.map(page => 
          result.count > 0 && pageIds.includes(page.id) 
            ? { ...page, icon: null } 
            : page
        ));
        
        setShowConfirmModal(false);
        alert(`Removed icons from ${result.totalProcessed} filtered pages out of ${result.totalRequested} pages with icons`);
      } else {
        throw new Error('Failed to remove icons');
      }
    } catch (err) {
      console.error('Error removing all icons:', err);
      alert('Failed to remove all icons');
    } finally {
      setIsRemoving(false);
    }
  }, [pagesToRemoveIcons, isRemoving]);

  const handleSetAllCalendarIcons = useCallback(() => {
    const pagesToUpdate = pages.filter(page => !page.icon || page.icon.emoji !== '🗓️');
    if (pagesToUpdate.length === 0) {
      alert('All pages already have calendar icons');
      return;
    }
    setPagesToModify(pagesToUpdate);
    setShowUpdateModal(true);
  }, [pages]);

  const handleConfirmSetAllCalendarIcons = useCallback(async () => {
    if (isUpdating) return;

    try {
      setIsUpdating(true);
      const pageIds = pagesToModify.map(page => page.id);

      const response = await fetch('/api/notion-pages/icons', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pageIds, icon: '🗓️' })
      });
      
      if (response.ok) {
        const result = await response.json();
        setPages(pages => pages.map(page => 
          result.count > 0 && pageIds.includes(page.id)
            ? { ...page, icon: { type: 'emoji', emoji: '🗓️' } }
            : page
        ));
        
        setShowUpdateModal(false);
        alert(`Updated icons for ${result.totalProcessed} filtered pages out of ${result.totalRequested} pages`);
      } else {
        throw new Error('Failed to update icons');
      }
    } catch (err) {
      console.error('Error updating all icons:', err);
      alert('Failed to update icons');
    } finally {
      setIsUpdating(false);
    }
  }, [pagesToModify, isUpdating]);

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div>Loading...</div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div>{error}</div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Notion Pages</h2>
        <div className="d-flex gap-2">
          <Button 
            variant="outline-primary"
            size="sm"
            onClick={handleSetAllCalendarIcons}
            className="px-3"
            disabled={isUpdating}
          >
            <i className="bi bi-calendar me-2"></i>
            {isUpdating ? 'Updating...' : 'Set All Calendar Icons'}
          </Button>
          <Button 
            variant="outline-danger"
            size="sm"
            onClick={handleRemoveAllIconsClick}
            className="px-3"
            disabled={isRemoving}
          >
            <i className="bi bi-x-circle me-2"></i>
            {isRemoving ? 'Removing...' : 'Remove All Icons'}
          </Button>
        </div>
      </div>

      <Modal show={showUpdateModal} onHide={() => setShowUpdateModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Update Icons</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to set calendar icons (🗓️) for the following pages?</p>
          <ListGroup style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {pagesToModify.map(page => (
              <ListGroup.Item key={page.id} className="d-flex align-items-center">
                {page.icon?.type === 'emoji' && (
                  <span className="me-2" style={{ fontSize: '1.2em' }}>
                    {page.icon.emoji}
                  </span>
                )}
                {page.title}
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowUpdateModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleConfirmSetAllCalendarIcons}
            disabled={isUpdating}
          >
            {isUpdating ? 'Updating...' : 'Set Calendar Icons'}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Remove Icons</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to remove icons from the following pages?</p>
          <ListGroup style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {pagesToRemoveIcons.map(page => (
              <ListGroup.Item key={page.id} className="d-flex align-items-center">
                {page.icon?.type === 'emoji' && (
                  <span className="me-2" style={{ fontSize: '1.2em' }}>
                    {page.icon.emoji}
                  </span>
                )}
                {page.title}
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleConfirmRemoveAllIcons}
            disabled={isRemoving}
          >
            {isRemoving ? 'Removing...' : 'Remove Icons'}
          </Button>
        </Modal.Footer>
      </Modal>

      <Row xs={1} md={2} lg={3} className="g-4">
        {pages.map(page => (
          <PageCard 
            key={page.id} 
            page={page} 
            onRemoveIcon={removeIcon}
            onSetCalendarIcon={setCalendarIcon}
          />
        ))}
      </Row>
    </Container>
  );
}

export default App;
