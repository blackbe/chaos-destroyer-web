import { useState, useEffect } from 'react';
import { useAppStore } from '../store/appStore';
import { generateId } from '../lib/utils';
import { supabase } from '../lib/supabase';
import { useDrag, useDrop } from 'react-dnd';

export default function DebtsPage() {
  const { debts, addDebt, setDebts, updateDebt, deleteDebt, reorderDebts } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [editingDebtId, setEditingDebtId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    balance: '',
    apr: '',
    minimumPayment: '',
    dueDate: '1',
    payoffPriority: '',
    notes: '',
  });

  const loadDebts = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        console.log('No authenticated user session');
        return;
      }

      const { data: debtsData, error } = await supabase
        .from('debts')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching debts:', error);
        return;
      }

      if (debtsData) {
        // Clean up double commas in notes while loading
        for (const debt of debtsData) {
          if (debt.notes && debt.notes.includes(', ,')) {
            const cleanedNotes = debt.notes.replace(/,\s*,/g, ',').trim();
            if (cleanedNotes !== debt.notes) {
              await supabase
                .from('debts')
                .update({ notes: cleanedNotes })
                .eq('id', debt.id);
              debt.notes = cleanedNotes;
            }
          }
        }
        
        // Sort by priority (extracted from notes field)
        const sortedDebts = debtsData.sort((a, b) => {
          const priorityA = parseInt(a.notes?.match(/PRIORITY (\d+)/)?.[1] || '999');
          const priorityB = parseInt(b.notes?.match(/PRIORITY (\d+)/)?.[1] || '999');
          return priorityA - priorityB;
        });
        setDebts(sortedDebts);
      }
    } catch (error) {
      console.error('Error loading debts:', error);
    }
  };

  // Load debts from Supabase when auth is ready
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        loadDebts();
        reformatExistingDebts();
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  const reformatExistingDebts = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        console.log('No session for reformatting');
        return;
      }

      const { data: debtsData, error: fetchError } = await supabase
        .from('debts')
        .select('*')
        .eq('user_id', session.user.id);

      if (fetchError) {
        console.error('Error fetching debts for reformat:', fetchError);
        return;
      }

      if (debtsData && debtsData.length > 0) {
        console.log('Reformatting', debtsData.length, 'debts');
        
        // Reformat each debt's notes
        for (const debt of debtsData) {
          if (debt.notes && debt.notes.includes('PRIORITY')) {
            // Extract priority number
            const priorityMatch = debt.notes.match(/PRIORITY\s+(\d+)/);
            if (priorityMatch) {
              const priority = priorityMatch[1];
              
              // Remove all PRIORITY mentions and clean up
              let withoutPriority = debt.notes
                .replace(/PRIORITY\s+\d+/g, '') // Remove PRIORITY X
                .replace(/,+/g, ',') // Replace multiple commas with single
                .trim()
                .replace(/^,\s*/, '') // Remove leading comma
                .replace(/,\s*$/, ''); // Remove trailing comma
              
              // Build new format: PRIORITY X, [rest]
              const newNotes = withoutPriority && withoutPriority.length > 0
                ? `PRIORITY ${priority}, ${withoutPriority}`
                : `PRIORITY ${priority}`;
              
              // Update if it changed
              if (newNotes !== debt.notes) {
                console.log(`Updating ${debt.name}: "${debt.notes}" → "${newNotes}"`);
                const { error: updateError } = await supabase
                  .from('debts')
                  .update({ notes: newNotes })
                  .eq('id', debt.id);
                
                if (updateError) {
                  console.error('Error updating debt:', updateError);
                }
              }
            }
          }
        }
        console.log('Reformatting complete, reloading...');
        // Reload after all updates
        await loadDebts();
      }
    } catch (error) {
      console.error('Error reformatting debts:', error);
    }
  };

  const handleAddDebt = async () => {
    if (!formData.name.trim()) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        console.error('No authenticated user session');
        return;
      }

      const user = session.user;

      const priority = parseInt(formData.payoffPriority) || debts.length + 1;
      let notes = `PRIORITY ${priority}`;
      
      // Format notes: "PRIORITY X, Target: $XXX/mo"
      if (formData.notes) {
        notes = `${notes}, ${formData.notes}`;
      }

      const newDebt = {
        user_id: user.id,
        name: formData.name,
        amount: parseFloat(formData.balance) || 0,
        interest_rate: parseFloat(formData.apr) || 0,
        minimum_payment: parseFloat(formData.minimumPayment) || 0,
        original_amount: parseFloat(formData.balance) || 0,
        notes: notes,
        status: 'active',
      };

      const { data, error } = await supabase
        .from('debts')
        .insert([newDebt])
        .select();

      if (error) {
        console.error('Error adding debt:', error);
        return;
      }

      if (data) {
        addDebt(data[0]);
      }

      setFormData({
        name: '',
        balance: '',
        apr: '',
        minimumPayment: '',
        dueDate: '1',
        payoffPriority: '',
        notes: '',
      });
      setShowForm(false);
    } catch (error) {
      console.error('Error in handleAddDebt:', error);
    }
  };

  const handleEditDebt = (debt) => {
    setEditingDebtId(debt.id);
    // Extract notes to separate priority and target
    const priorityMatch = debt.notes?.match(/PRIORITY (\d+)/);
    const priority = priorityMatch ? priorityMatch[1] : '';
    const notesText = debt.notes?.replace(/PRIORITY \d+,?\s*/, '').trim() || '';
    
    setFormData({
      name: debt.name,
      balance: debt.amount?.toString() || '',
      apr: debt.interest_rate?.toString() || '',
      minimumPayment: debt.minimum_payment?.toString() || '',
      dueDate: '1',
      payoffPriority: priority,
      notes: notesText,
    });
    setShowForm(true);
  };

  const handleSaveEdit = async () => {
    if (!formData.name.trim()) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        console.error('No authenticated user session');
        return;
      }

      const priority = parseInt(formData.payoffPriority) || debts.length + 1;
      let notes = `PRIORITY ${priority}`;
      
      if (formData.notes) {
        notes = `${notes}, ${formData.notes}`;
      }

      const { error } = await supabase
        .from('debts')
        .update({
          name: formData.name,
          amount: parseFloat(formData.balance) || 0,
          interest_rate: parseFloat(formData.apr) || 0,
          minimum_payment: parseFloat(formData.minimumPayment) || 0,
          original_amount: parseFloat(formData.balance) || 0,
          notes: notes,
        })
        .eq('id', editingDebtId);

      if (error) {
        console.error('Error updating debt:', error);
        return;
      }

      setEditingDebtId(null);
      setFormData({
        name: '',
        balance: '',
        apr: '',
        minimumPayment: '',
        dueDate: '1',
        payoffPriority: '',
        notes: '',
      });
      setShowForm(false);
      loadDebts();
    } catch (error) {
      console.error('Error in handleSaveEdit:', error);
    }
  };

  const handleDeleteDebt = async (debtId) => {
    try {
      const { error } = await supabase
        .from('debts')
        .delete()
        .eq('id', debtId);

      if (error) {
        console.error('Error deleting debt:', error);
        return;
      }

      deleteDebt(debtId);
    } catch (error) {
      console.error('Error in handleDeleteDebt:', error);
    }
  };

  const handleDragEnd = async (result) => {
    const { source, destination } = result;

    // If dropped outside the list, do nothing
    if (!destination) return;

    // If dropped in same position, do nothing
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    // Create a new sorted array based on drop position
    const sortedDebts = Array.from(debts);
    const [reorderedDebt] = sortedDebts.splice(source.index, 1);
    sortedDebts.splice(destination.index, 0, reorderedDebt);

    // Update priorities based on new order
    const updatedDebts = sortedDebts.map((debt, index) => ({
      ...debt,
      notes: debt.notes.replace(/PRIORITY \d+/, `PRIORITY ${index + 1}`),
    }));

    // Update local state
    setDebts(updatedDebts);

    // Save to Supabase
    try {
      for (const debt of updatedDebts) {
        const { error } = await supabase
          .from('debts')
          .update({ notes: debt.notes })
          .eq('id', debt.id);

        if (error) {
          console.error('Error updating debt priority:', error);
        }
      }
    } catch (error) {
      console.error('Error in handleDragEnd:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold chaos-text">💳 MANAGE DEBTS</h1>
        <button
          onClick={() => {
            setShowForm(!showForm);
            if (showForm) {
              setEditingDebtId(null);
              setFormData({
                name: '',
                balance: '',
                apr: '',
                minimumPayment: '',
                dueDate: '1',
                payoffPriority: '',
                notes: '',
              });
            }
          }}
          className="chaos-button"
        >
          {showForm ? '❌ Cancel' : '➕ Add Debt'}
        </button>
      </div>

      {showForm && (
        <div className="chaos-card">
          <h2 className="text-xl font-bold chaos-text mb-4">{editingDebtId ? 'Edit Debt' : 'Add New Debt'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Debt name (e.g., Chase CC)"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <input
              type="number"
              placeholder="Current balance"
              value={formData.balance}
              onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
            />
            <input
              type="number"
              step="0.01"
              placeholder="APR (%)"
              value={formData.apr}
              onChange={(e) => setFormData({ ...formData, apr: e.target.value })}
            />
            <input
              type="number"
              step="0.01"
              placeholder="Minimum payment"
              value={formData.minimumPayment}
              onChange={(e) => setFormData({ ...formData, minimumPayment: e.target.value })}
            />
            <input
              type="number"
              min="1"
              placeholder="Priority (1 = highest)"
              value={formData.payoffPriority}
              onChange={(e) => setFormData({ ...formData, payoffPriority: parseInt(e.target.value) || debts.length })}
            />
            <input
              type="text"
              placeholder="Notes (optional)"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={editingDebtId ? handleSaveEdit : handleAddDebt}
              className="flex-1 chaos-button"
            >
              ✅ {editingDebtId ? 'Save Changes' : 'Add Debt'}
            </button>
            <button
              onClick={() => {
                setShowForm(false);
                setEditingDebtId(null);
                setFormData({
                  name: '',
                  balance: '',
                  apr: '',
                  minimumPayment: '',
                  dueDate: '1',
                  payoffPriority: '',
                  notes: '',
                });
              }}
              className="px-6 bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded transition-all"
            >
              ❌ Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {debts && debts.length > 0 ? (
          <>
            {debts.map((debt, index) => (
              <div
                key={debt.id}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.effectAllowed = 'move';
                  e.dataTransfer.setData('sourceIndex', index.toString());
                }}
                onDragEnd={(e) => {
                  setDragOverIndex(null);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                  setDragOverIndex(index);
                }}
                onDragLeave={(e) => {
                  setDragOverIndex(null);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  
                  const sourceIndex = parseInt(e.dataTransfer.getData('sourceIndex'));
                  const targetIndex = index;
                  
                  if (sourceIndex !== targetIndex && sourceIndex !== null && !isNaN(sourceIndex)) {
                    const reorderedDebts = [...debts];
                    const [movedDebt] = reorderedDebts.splice(sourceIndex, 1);
                    
                    let insertIndex = targetIndex;
                    if (sourceIndex < targetIndex) {
                      insertIndex = targetIndex - 1;
                    }
                    
                    reorderedDebts.splice(insertIndex, 0, movedDebt);
                    
                    // Update priorities
                    const updatedDebts = reorderedDebts.map((d, idx) => ({
                      ...d,
                      notes: d.notes.replace(/PRIORITY \d+/, `PRIORITY ${idx + 1}`),
                    }));
                    
                    // Save all at once
                    Promise.all(
                      updatedDebts.map((d) =>
                        supabase
                          .from('debts')
                          .update({ notes: d.notes })
                          .eq('id', d.id)
                      )
                    ).then(() => {
                      loadDebts();
                    }).catch((err) => console.error('Error:', err));
                  }
                  
                  setDragOverIndex(null);
                }}
                className={`relative chaos-card transition-all cursor-move ${
                  dragOverIndex === index ? 'ring-2 ring-cyan-400' : ''
                }`}
              >
                {dragOverIndex === index && (
                  <div className="absolute -top-2 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 rounded"></div>
                )}
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white">{debt.name || 'Unnamed Debt'}</h3>
                    <div className="text-sm text-gray-400 mt-1">
                      Balance: ${((debt.amount) || 0).toLocaleString(undefined, {minimumFractionDigits: 2})} | APR: {((debt.interest_rate) || 0).toFixed(2)}% | Min: ${((debt.minimum_payment) || 0).toFixed(2)}
                    </div>
                    {debt.notes && (
                      <div className="text-xs text-gray-500 mt-1 italic">{debt.notes}</div>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4 flex-shrink-0">
                    <button
                      onClick={() => handleEditDebt(debt)}
                      className="text-blue-400 hover:text-blue-300 font-bold transition-colors"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDeleteDebt(debt.id)}
                      className="text-red-400 hover:text-red-300 font-bold transition-colors"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Drop zone for end of list */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                setDragOverIndex(debts.length);
              }}
              onDragLeave={() => {
                setDragOverIndex(null);
              }}
              onDrop={(e) => {
                e.preventDefault();
                
                const sourceIndex = parseInt(e.dataTransfer.getData('sourceIndex'));
                
                if (sourceIndex !== debts.length - 1 && !isNaN(sourceIndex)) {
                  const reorderedDebts = [...debts];
                  const [movedDebt] = reorderedDebts.splice(sourceIndex, 1);
                  reorderedDebts.push(movedDebt);
                  
                  // Update priorities
                  const updatedDebts = reorderedDebts.map((d, idx) => ({
                    ...d,
                    notes: d.notes.replace(/PRIORITY \d+/, `PRIORITY ${idx + 1}`),
                  }));
                  
                  // Save all at once
                  Promise.all(
                    updatedDebts.map((d) =>
                      supabase
                        .from('debts')
                        .update({ notes: d.notes })
                        .eq('id', d.id)
                    )
                  ).then(() => {
                    loadDebts();
                  }).catch((err) => console.error('Error:', err));
                }
                
                setDragOverIndex(null);
              }}
              className="h-8 relative"
            >
              {dragOverIndex === debts.length && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 rounded shadow-lg"></div>
              )}
            </div>
          </>
        ) : (
          <p className="text-gray-400">No debts yet. Add one to get started!</p>
        )}
      </div>
    </div>
  );
}
