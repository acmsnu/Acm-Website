import React, { useState, useEffect } from 'react';
import { fetchTeam, fetchWithAuth, API_BASE_URL } from '../utils/api';
import { Plus, Edit, Trash2, X, MoveUp, MoveDown, ChevronDown, ChevronRight } from 'lucide-react';

export default function AdminTeam() {
  const [coreMembers, setCoreMembers] = useState([]);
  const [subcoreMembers, setSubcoreMembers] = useState([]);
  const [facultyMembers, setFacultyMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [coreOpen, setCoreOpen] = useState(true);
  const [subcoreOpen, setSubcoreOpen] = useState(true);
  const [facultyOpen, setFacultyOpen] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [formData, setFormData] = useState({ name: '', position: '', category: 'core' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await fetchTeam();
      setCoreMembers(data.core);
      setSubcoreMembers(data.subcore);
      setFacultyMembers(data.faculty || []);
    } catch (err) {
      console.error(err);
      alert('Failed to load team data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setEditingMember(null);
    setFormData({ name: '', position: '', category: 'core' });
    setSelectedFile(null);
    setPreviewImage(null);
    setIsModalOpen(true);
  };

  const openEditModal = (member) => {
    setEditingMember(member);
    setFormData({ name: member.name, position: member.position, category: member.category });
    setSelectedFile(null);
    setPreviewImage(member.image_url || null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingMember) {
        const res = await fetchWithAuth(`/team/${editingMember.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        if (!res.ok) throw new Error('Failed to update details');

        if (selectedFile) {
          const imgData = new FormData();
          imgData.append('image', selectedFile);
          const imgRes = await fetchWithAuth(`/team/${editingMember.id}/image`, {
            method: 'PUT',
            body: imgData
          });
          if (!imgRes.ok) throw new Error('Failed to update image');
        }
      } else {
        const data = new FormData();
        data.append('name', formData.name);
        data.append('position', formData.position);
        data.append('category', formData.category);
        if (selectedFile) data.append('image', selectedFile);
        
        const res = await fetchWithAuth('/team', {
          method: 'POST',
          body: data
        });
        if (!res.ok) throw new Error('Failed to add member');
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

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this member?')) return;
    
    try {
      const res = await fetchWithAuth(`/team/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      loadData();
    } catch (err) {
      console.error(err);
      alert('Failed to delete');
    }
  };

  const handleReorder = async (member, direction) => {
    let list;
    if (member.category === 'core') list = [...coreMembers];
    else if (member.category === 'subcore') list = [...subcoreMembers];
    else list = [...facultyMembers];
    
    const index = list.findIndex(m => m.id === member.id);
    if (direction === 'up' && index > 0) {
      [list[index - 1], list[index]] = [list[index], list[index - 1]];
    } else if (direction === 'down' && index < list.length - 1) {
      [list[index + 1], list[index]] = [list[index], list[index + 1]];
    } else {
      return;
    }
    
    const updatedItems = list.map((m, i) => ({ id: m.id, display_order: i }));
    
    if (member.category === 'core') setCoreMembers(list);
    else if (member.category === 'subcore') setSubcoreMembers(list);
    else setFacultyMembers(list);

    try {
      await fetchWithAuth('/team/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: updatedItems })
      });
    } catch (err) {
      console.error(err);
      alert('Reorder failed');
      loadData();
    }
  };

  const renderSection = (members, title, isOpen, setIsOpen) => (
    <div className="mb-8">
      {/* Collapsible Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between mb-4 group"
      >
        <h3 className="font-pixelify text-2xl md:text-3xl text-[#ff8cbe] drop-shadow-[2px_2px_0_rgba(0,0,0,1)]">{title}</h3>
        <span className="text-[#ff8cbe] transition-transform duration-200">
          {isOpen ? <ChevronDown size={28} /> : <ChevronRight size={28} />}
        </span>
      </button>

      {isOpen && (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-[#1a0f30]/80 rounded-xl border-2 border-[#3b2d1d] overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#ff5ea6]/20 font-vt323 text-2xl text-white">
                  <th className="p-4 border-b-2 border-[#3b2d1d] w-16">Order</th>
                  <th className="p-4 border-b-2 border-[#3b2d1d] w-24">Photo</th>
                  <th className="p-4 border-b-2 border-[#3b2d1d]">Name</th>
                  <th className="p-4 border-b-2 border-[#3b2d1d]">Position</th>
                  <th className="p-4 border-b-2 border-[#3b2d1d] w-32">Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center font-vt323 text-2xl text-gray-400">No members found.</td>
                  </tr>
                ) : (
                  members.map((member, index) => (
                    <tr key={member.id} className="border-b border-[#3b2d1d]/50 hover:bg-white/5 transition-colors font-vt323 text-xl text-gray-200">
                      <td className="p-4">
                        <div className="flex flex-col items-center gap-1">
                          <button disabled={index === 0} onClick={() => handleReorder(member, 'up')} className="disabled:opacity-20 hover:text-[#ff5ea6]"><MoveUp size={16} /></button>
                          <button disabled={index === members.length - 1} onClick={() => handleReorder(member, 'down')} className="disabled:opacity-20 hover:text-[#ff5ea6]"><MoveDown size={16} /></button>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="w-12 h-12 rounded bg-black/50 overflow-hidden border border-[#ff8cbe]/30 flex items-center justify-center">
                          {member.image_url ? (
                            <img src={member.image_url} alt={member.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs">No image</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">{member.name}</td>
                      <td className="p-4">{member.position}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <button onClick={() => openEditModal(member)} className="text-blue-400 hover:text-blue-300" title="Edit">
                            <Edit size={20} />
                          </button>
                          <button onClick={() => handleDelete(member.id)} className="text-red-400 hover:text-red-300" title="Delete">
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
            {members.length === 0 ? (
              <div className="p-6 text-center font-vt323 text-xl text-gray-400 bg-[#1a0f30]/80 rounded-xl border-2 border-[#3b2d1d]">No members found.</div>
            ) : (
              members.map((member, index) => (
                <div key={member.id} className="bg-[#1a0f30]/80 rounded-xl border-2 border-[#3b2d1d] p-4 flex items-center gap-4">
                  {/* Reorder */}
                  <div className="flex flex-col items-center gap-1 shrink-0">
                    <button disabled={index === 0} onClick={() => handleReorder(member, 'up')} className="disabled:opacity-20 text-gray-400 hover:text-[#ff5ea6]"><MoveUp size={18} /></button>
                    <button disabled={index === members.length - 1} onClick={() => handleReorder(member, 'down')} className="disabled:opacity-20 text-gray-400 hover:text-[#ff5ea6]"><MoveDown size={18} /></button>
                  </div>

                  {/* Photo */}
                  <div className="w-14 h-14 rounded-lg bg-black/50 overflow-hidden border border-[#ff8cbe]/30 flex items-center justify-center shrink-0">
                    {member.image_url ? (
                      <img src={member.image_url} alt={member.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs font-vt323 text-gray-500">No img</span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-pixelify text-lg text-white truncate">{member.name}</h4>
                    <p className="font-vt323 text-base text-[#ff8cbe] truncate">{member.position}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 shrink-0">
                    <button onClick={() => openEditModal(member)} className="text-blue-400 hover:text-blue-300"><Edit size={20} /></button>
                    <button onClick={() => handleDelete(member.id)} className="text-red-400 hover:text-red-300"><Trash2 size={20} /></button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h2 className="font-pixelify text-3xl md:text-4xl text-white drop-shadow-[2px_2px_0_rgba(0,0,0,1)]">Manage Guild Members</h2>
        <button 
          onClick={openAddModal}
          className="flex items-center gap-2 bg-[#ff5ea6] hover:bg-[#ff8cbe] text-black font-vt323 text-xl md:text-2xl font-bold py-2 px-4 rounded border-b-4 border-[#3b2d1d] active:border-b-0 active:translate-y-[4px] transition-all"
        >
          <Plus size={20} />
          Add Member
        </button>
      </div>

      {isLoading ? (
        <div className="font-vt323 text-3xl text-gray-400 animate-pulse text-center mt-20">Loading members...</div>
      ) : (
        <>
          {renderSection(coreMembers, 'Core Team', coreOpen, setCoreOpen)}
          {renderSection(subcoreMembers, 'Elite Vanguard (Subcore)', subcoreOpen, setSubcoreOpen)}
          {renderSection(facultyMembers, 'Faculty Sponsors', facultyOpen, setFacultyOpen)}
        </>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#1a0f30] border-4 border-[#ff5ea6] rounded-xl p-6 md:p-8 max-w-lg w-full relative shadow-[8px_8px_0_rgba(0,0,0,0.8)]">
            <button onClick={closeModal} className="absolute top-4 right-4 text-gray-400 hover:text-white">
              <X size={28} />
            </button>
            
            <h2 className="font-pixelify text-4xl text-white mb-6">
              {editingMember ? 'Edit Member' : 'Add New Member'}
            </h2>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-5 font-vt323 text-xl text-white">
              <div className="flex flex-col gap-1">
                <label className="text-[#ff8cbe]">Name *</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="bg-black/50 border-2 border-[#ff8cbe]/50 rounded p-2 focus:outline-none focus:border-[#ff5ea6]"
                  required 
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[#ff8cbe]">Position *</label>
                <input 
                  type="text" 
                  value={formData.position}
                  onChange={e => setFormData({...formData, position: e.target.value})}
                  className="bg-black/50 border-2 border-[#ff8cbe]/50 rounded p-2 focus:outline-none focus:border-[#ff5ea6]"
                  required 
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[#ff8cbe]">Category *</label>
                <select 
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                  className="bg-black/80 border-2 border-[#ff8cbe]/50 rounded p-2 focus:outline-none focus:border-[#ff5ea6]"
                  required
                >
                  <option value="core">Core Team</option>
                  <option value="subcore">Party Member (Subcore)</option>
                  <option value="faculty">Faculty Sponsor</option>
                </select>
              </div>

              <div className="flex flex-col gap-2 mt-2">
                <label className="text-[#ff8cbe]">Character Photo {editingMember ? '(Optional - leave blank to keep current)' : '*'}</label>
                
                {previewImage && (
                  <div className="w-24 h-24 rounded overflow-hidden border-2 border-[#ff5ea6] mb-2">
                    <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
                
                <input 
                  type="file" 
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={handleFileChange}
                  className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-bold file:bg-[#ff8cbe] file:text-black hover:file:bg-[#ff5ea6] cursor-pointer"
                  required={!editingMember}
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
    </div>
  );
}
