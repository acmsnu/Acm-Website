import React, { useState, useEffect } from 'react';
import { fetchAllEvents, fetchWithAuth } from '../utils/api';
import { Plus, Edit, Trash2, X, Star } from 'lucide-react';

export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null); // null means adding new
  const [formData, setFormData] = useState({ title: '', description: '', date: '', location: '', is_featured: false });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteModalId, setDeleteModalId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAllEvents();
      setEvents(data);
    } catch (err) {
      console.error(err);
      alert('Failed to load events data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setEditingEvent(null);
    setFormData({ title: '', description: '', date: '', location: '', is_featured: false });
    setSelectedFile(null);
    setPreviewImage(null);
    setIsModalOpen(true);
  };

  const openEditModal = (event) => {
    setEditingEvent(event);
    setFormData({ 
      title: event.title, 
      description: event.description, 
      date: event.date, 
      location: event.location,
      is_featured: Boolean(event.is_featured)
    });
    setSelectedFile(null);
    setPreviewImage(event.image_url || null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Enforce 5MB file size limit to match backend configuration
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB. Please choose a smaller image.');
        e.target.value = null; // Clear the input
        return;
      }

      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingEvent) {
        // Update existing details (PUT /api/events/:id)
        const res = await fetchWithAuth(`/events/${editingEvent.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        if (!res.ok) throw new Error('Failed to update details');

        // Update featured status if changed
        if (Boolean(editingEvent.is_featured) !== formData.is_featured) {
          await fetchWithAuth(`/events/${editingEvent.id}/featured`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ is_featured: formData.is_featured })
          });
        }

        // Update image if a new one was selected
        if (selectedFile) {
          const imgData = new FormData();
          imgData.append('image', selectedFile);
          const imgRes = await fetchWithAuth(`/events/${editingEvent.id}/image`, {
            method: 'PUT',
            body: imgData
          });
          if (!imgRes.ok) throw new Error('Failed to update image');
        }
      } else {
        // Add new event
        const data = new FormData();
        data.append('title', formData.title);
        data.append('description', formData.description);
        data.append('date', formData.date);
        data.append('location', formData.location);
        data.append('is_featured', formData.is_featured);
        if (selectedFile) data.append('image', selectedFile);
        
        const res = await fetchWithAuth('/events', {
          method: 'POST',
          body: data
        });
        if (!res.ok) throw new Error('Failed to add event');
      }

      closeModal();
      loadData();
    } catch (err) {
      console.error(err);
      alert('Operation failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    setDeleteModalId(id);
  };

  const executeDelete = async () => {
    if (!deleteModalId) return;
    setIsDeleting(true);
    try {
      const res = await fetchWithAuth(`/events/${deleteModalId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      loadData();
    } catch (err) {
      console.error(err);
      alert('Failed to delete');
    } finally {
      setIsDeleting(false);
      setDeleteModalId(null);
    }
  };

  const handleToggleFeatured = async (event) => {
    try {
      const newStatus = !event.is_featured;
      
      // Optimistic update
      setEvents(events.map(e => e.id === event.id ? { ...e, is_featured: newStatus ? 1 : 0 } : e));
      
      const res = await fetchWithAuth(`/events/${event.id}/featured`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_featured: newStatus })
      });
      
      if (!res.ok) {
        throw new Error('Toggle failed');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to toggle featured status');
      loadData(); // revert
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="font-pixelify text-4xl text-white drop-shadow-[2px_2px_0_rgba(0,0,0,1)]">Manage Quests / Events</h2>
        <button 
          onClick={openAddModal}
          className="flex items-center gap-2 bg-[#ff5ea6] hover:bg-[#ff8cbe] text-black font-vt323 text-2xl font-bold py-2 px-4 rounded border-b-4 border-[#3b2d1d] active:border-b-0 active:translate-y-[4px] transition-all"
        >
          <Plus size={24} />
          Add Event
        </button>
      </div>

      <div className="bg-yellow-500/10 border-l-4 border-yellow-500 p-4 mb-8 text-yellow-200 font-vt323 text-xl">
        <span className="font-bold">Tip:</span> Click the <Star className="inline mx-1" size={16} /> star icon to feature an event on the homepage.
      </div>

      {isLoading ? (
        <div className="font-vt323 text-3xl text-gray-400 animate-pulse text-center mt-20">Loading events...</div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-[#1a0f30]/80 rounded-xl border-2 border-[#3b2d1d] overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#ff5ea6]/20 font-vt323 text-2xl text-white">
                  <th className="p-4 border-b-2 border-[#3b2d1d] w-16 text-center">Featured</th>
                  <th className="p-4 border-b-2 border-[#3b2d1d] w-24">Image</th>
                  <th className="p-4 border-b-2 border-[#3b2d1d]">Title</th>
                  <th className="p-4 border-b-2 border-[#3b2d1d]">Date</th>
                  <th className="p-4 border-b-2 border-[#3b2d1d] w-32">Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center font-vt323 text-2xl text-gray-400">No events found.</td>
                  </tr>
                ) : (
                  events.map((event) => (
                    <tr key={event.id} className={`border-b border-[#3b2d1d]/50 hover:bg-white/5 transition-colors font-vt323 text-xl ${event.is_featured ? 'text-white' : 'text-gray-300'}`}>
                      <td className="p-4 text-center">
                        <button 
                          onClick={() => handleToggleFeatured(event)}
                          className={`p-2 rounded-full transition-colors ${event.is_featured ? 'text-yellow-400 hover:text-yellow-300' : 'text-gray-600 hover:text-gray-400'}`}
                          title={event.is_featured ? "Remove from featured" : "Mark as featured"}
                        >
                          <Star size={24} fill={event.is_featured ? "currentColor" : "none"} />
                        </button>
                      </td>
                      <td className="p-4">
                        <div className="w-16 h-12 rounded bg-black/50 overflow-hidden border border-[#ff8cbe]/30 flex items-center justify-center">
                          {event.image_url ? (
                            <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs">No image</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 font-bold">{event.title}</td>
                      <td className="p-4">{event.date || 'TBA'}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <button onClick={() => openEditModal(event)} className="text-blue-400 hover:text-blue-300" title="Edit">
                            <Edit size={20} />
                          </button>
                          <button onClick={() => handleDelete(event.id)} className="text-red-400 hover:text-red-300" title="Delete">
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden flex flex-col gap-3">
            {events.length === 0 ? (
              <div className="p-6 text-center font-vt323 text-xl text-gray-400 bg-[#1a0f30]/80 rounded-xl border-2 border-[#3b2d1d]">No events found.</div>
            ) : (
              events.map((event) => (
                <div key={event.id} className={`bg-[#1a0f30]/80 rounded-xl border-2 border-[#3b2d1d] p-4 flex flex-col gap-3 ${event.is_featured ? 'border-[#ff5ea6]/50 shadow-[0_0_10px_rgba(255,94,166,0.1)]' : ''}`}>
                  <div className="flex items-center gap-4">
                    {/* Featured Toggle */}
                    <button 
                      onClick={() => handleToggleFeatured(event)}
                      className={`p-2 rounded-full shrink-0 transition-colors ${event.is_featured ? 'text-yellow-400 hover:text-yellow-300 bg-yellow-400/10' : 'text-gray-600 hover:text-gray-400 bg-gray-800'}`}
                      title={event.is_featured ? "Remove from featured" : "Mark as featured"}
                    >
                      <Star size={20} fill={event.is_featured ? "currentColor" : "none"} />
                    </button>

                    {/* Image */}
                    <div className="w-16 h-12 rounded bg-black/50 overflow-hidden border border-[#ff8cbe]/30 flex items-center justify-center shrink-0">
                      {event.image_url ? (
                        <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs font-vt323 text-gray-500">No img</span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-pixelify text-lg truncate ${event.is_featured ? 'text-white' : 'text-gray-300'}`}>{event.title}</h4>
                      <p className="font-vt323 text-base text-[#ff8cbe] truncate">{event.date || 'TBA'}</p>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex justify-end items-center gap-4 pt-2 border-t border-[#3b2d1d]/50">
                    <button onClick={() => openEditModal(event)} className="flex items-center gap-1 text-blue-400 hover:text-blue-300 font-vt323 text-lg"><Edit size={16} /> Edit</button>
                    <button onClick={() => handleDelete(event.id)} className="flex items-center gap-1 text-red-400 hover:text-red-300 font-vt323 text-lg"><Trash2 size={16} /> Delete</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto pt-24 pb-12">
          <div className="bg-[#1a0f30] border-4 border-[#ff5ea6] rounded-xl p-6 md:p-8 max-w-2xl w-full relative shadow-[8px_8px_0_rgba(0,0,0,0.8)] my-auto">
            <button onClick={closeModal} className="absolute top-4 right-4 text-gray-400 hover:text-white">
              <X size={28} />
            </button>
            
            <h2 className="font-pixelify text-4xl text-white mb-6">
              {editingEvent ? 'Edit Quest / Event' : 'Create New Quest'}
            </h2>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-5 font-vt323 text-xl text-white">
              
              <div className="flex flex-col gap-1">
                <label className="text-[#ff8cbe]">Title *</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="bg-black/50 border-2 border-[#ff8cbe]/50 rounded p-2 focus:outline-none focus:border-[#ff5ea6]"
                  required 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1">
                  <label className="text-[#ff8cbe]">Date</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Oct 24-26, 2026"
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                    className="bg-black/50 border-2 border-[#ff8cbe]/50 rounded p-2 focus:outline-none focus:border-[#ff5ea6]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[#ff8cbe]">Location</label>
                  <input 
                    type="text" 
                    placeholder="e.g. SNU Campus"
                    value={formData.location}
                    onChange={e => setFormData({...formData, location: e.target.value})}
                    className="bg-black/50 border-2 border-[#ff8cbe]/50 rounded p-2 focus:outline-none focus:border-[#ff5ea6]"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[#ff8cbe]">Description</label>
                <textarea 
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="bg-black/50 border-2 border-[#ff8cbe]/50 rounded p-2 h-32 focus:outline-none focus:border-[#ff5ea6] resize-none"
                />
              </div>

              <div className="flex items-center gap-3 mt-2">
                <input 
                  type="checkbox"
                  id="featured-checkbox"
                  checked={formData.is_featured}
                  onChange={e => setFormData({...formData, is_featured: e.target.checked})}
                  className="w-5 h-5 accent-[#ff5ea6] cursor-pointer"
                />
                <label htmlFor="featured-checkbox" className="text-yellow-400 cursor-pointer flex items-center gap-2">
                  <Star size={20} fill="currentColor" />
                  Feature on Homepage
                </label>
              </div>

              <div className="flex flex-col gap-2 mt-2">
                <label className="text-[#ff8cbe]">Event Image {editingEvent ? '(Optional - leave blank to keep current)' : '*'}</label>
                
                {previewImage && (
                  <div className="w-full max-w-[200px] aspect-video rounded overflow-hidden border-2 border-[#ff5ea6] mb-2">
                    <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
                
                <input 
                  type="file" 
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={handleFileChange}
                  className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-bold file:bg-[#ff8cbe] file:text-black hover:file:bg-[#ff5ea6] cursor-pointer"
                  required={!editingEvent}
                />
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button 
                  type="button" 
                  onClick={closeModal}
                  className="px-6 py-2 rounded bg-gray-600 hover:bg-gray-500 font-bold transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-6 py-2 rounded bg-[#ff5ea6] hover:bg-[#ff8cbe] text-black font-bold disabled:opacity-50 transition-colors shadow-[2px_2px_0_rgba(0,0,0,0.8)]"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {deleteModalId && (
        <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#1a0f30] border-4 border-red-500 rounded-xl p-6 md:p-8 max-w-lg w-full relative shadow-[8px_8px_0_rgba(0,0,0,0.8)] text-center">
            <h2 className="font-pixelify text-3xl text-red-400 mb-4 drop-shadow-[2px_2px_0_rgba(0,0,0,1)]">Delete Event?</h2>
            <p className="font-vt323 text-2xl text-white mb-8">Are you sure you want to delete this event? This action cannot be undone and will permanently remove it from the guild logs.</p>
            
            <div className="flex justify-center gap-6 font-vt323 text-xl">
              <button 
                onClick={() => setDeleteModalId(null)}
                disabled={isDeleting}
                className="px-6 py-2 rounded bg-gray-600 hover:bg-gray-500 text-white font-bold transition-colors shadow-[2px_2px_0_rgba(0,0,0,0.8)] disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={executeDelete}
                disabled={isDeleting}
                className="px-6 py-2 rounded bg-red-500 hover:bg-red-400 text-black font-bold transition-colors shadow-[2px_2px_0_rgba(0,0,0,0.8)] disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
