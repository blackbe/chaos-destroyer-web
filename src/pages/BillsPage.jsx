import { useState, useEffect } from 'react';
import { useAppStore } from '../store/appStore';
import { formatCurrency } from '../lib/utils';
import { supabase } from '../lib/supabase';

function calculateDaysUntilDue(dueDay, frequency) {
  const today = new Date();
  
  // For weekly bills (like WCS Wednesday), calculate days to next occurrence
  if (frequency === 'weekly') {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const targetDayName = dueDay; // e.g., "Wednesday"
    const targetDayIndex = dayNames.indexOf(targetDayName);
    
    if (targetDayIndex === -1) {
      // Fallback if day name is a number
      const currentDay = today.getDate();
      return parseInt(dueDay) - currentDay;
    }
    
    const currentDayIndex = today.getDay();
    let daysUntil = (targetDayIndex - currentDayIndex + 7) % 7;
    
    // If today is the target day and we haven't paid yet, show 0 days
    if (daysUntil === 0) {
      daysUntil = 0;
    }
    
    return daysUntil;
  }
  
  // For monthly bills, simple calculation
  const currentDay = today.getDate();
  const daysUntil = dueDay - currentDay;
  
  return daysUntil;
}

function getDueStatus(daysUntil, lastPaid, frequency, status) {
  // If marked as completed, show as paid
  if (status === 'completed') {
    return { text: '✓ Paid', color: 'text-green-400' };
  }
  
  // If paid (lastPaid is set), show as paid
  if (lastPaid) {
    const lastPaidDate = new Date(lastPaid);
    const today = new Date();
    if (lastPaidDate.toDateString() === today.toDateString()) {
      return { text: '✓ Paid today', color: 'text-green-400' };
    }
    // Paid on a previous date - show past due days if applicable
    if (daysUntil < 0) {
      return { text: `✓ Paid (${Math.abs(daysUntil)} days overdue)`, color: 'text-green-400' };
    }
    return { text: '✓ Paid', color: 'text-green-400' };
  }
  
  // For weekly bills
  if (frequency === 'weekly') {
    // If paid today (daysUntil === 0 but lastPaid is today), show next week
    if (daysUntil === 0 && lastPaid) {
      const lastPaidDate = new Date(lastPaid);
      const today = new Date();
      if (lastPaidDate.toDateString() === today.toDateString()) {
        // Paid today, next due is in 7 days
        return { text: '✓ Paid today • Due in 7 days', color: 'text-green-400' };
      }
      return { text: '⏰ DUE TODAY (weekly)', color: 'text-orange-400' };
    }
    if (daysUntil === 0) {
      return { text: '⏰ DUE TODAY (weekly)', color: 'text-orange-400' };
    }
    if (daysUntil === 1) {
      return { text: '⏰ Tomorrow (weekly)', color: 'text-yellow-400' };
    }
    return { text: `✓ In ${daysUntil} days (weekly)`, color: 'text-green-400' };
  }
  
  // For monthly bills
  if (daysUntil < 0 && (!lastPaid || lastPaid === null)) {
    return { text: '⚠️ PAST DUE', color: 'text-red-400' };
  }
  if (daysUntil === 0) {
    return { text: '⚠️ DUE TODAY', color: 'text-orange-400' };
  }
  if (daysUntil > 0 && daysUntil <= 3) {
    return { text: `⏰ ${daysUntil} day${daysUntil === 1 ? '' : 's'} left`, color: 'text-yellow-400' };
  }
  return { text: `✓ ${daysUntil} days`, color: 'text-green-400' };
}

export default function BillsPage() {
  const { bills, updateBill, debts, updateDebt, deleteBill, deleteDebt, setBills, setDebts } = useAppStore();
  const [editingBill, setEditingBill] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [addingBill, setAddingBill] = useState(false);
  const [addForm, setAddForm] = useState({
    name: '',
    amount: '',
    dueDate: '',
    frequency: 'monthly',
    category: 'utilities',
    notes: '',
  });
  const [cashOnHand, setCashOnHand] = useState(2310.68);
  const [editingCash, setEditingCash] = useState(false);
  const [cashInput, setCashInput] = useState(cashOnHand.toString());

  // Fetch debts and bills from Supabase on mount
  useEffect(() => {
    loadBillsAndDebts();
  }, []);

  const loadBillsAndDebts = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user?.id) return;

      const userId = user.user.id;

      // Fetch debts
      const { data: debtsData } = await supabase
        .from('debts')
        .select('*')
        .eq('user_id', userId);

      // Fetch bills
      const { data: billsData } = await supabase
        .from('bills')
        .select('*')
        .eq('user_id', userId);

      // Map debts
      const priorityMap = {
        'Chase CC': 1,
        'OnPoint CC': 2,
        'Car Loan': 3,
        'Mom Loan': 4,
        'Lawyer Fees': 5,
      };

      const mappedDebts = debtsData?.map(debt => ({
        ...debt,
        balance: parseFloat(debt.amount) || 0,
        apr: parseFloat(debt.interest_rate) || 0,
        originalBalance: parseFloat(debt.original_amount) || 0,
        minimumPayment: parseFloat(debt.minimum_payment) || 0,
        dueDate: debt.due_date,
        lastPaid: debt.last_paid,
        payoffPriority: priorityMap[debt.name] || 99,
      })) || [];

      // Map bills
      const mappedBills = billsData?.map(bill => ({
        ...bill,
        amount: parseFloat(bill.amount) || 0,
        dueDate: bill.due_date,
        status: bill.status || 'active',
      })) || [];

      if (mappedDebts.length > 0) setDebts(mappedDebts);
      if (mappedBills.length > 0) setBills(mappedBills);
    } catch (err) {
      console.error('Error loading bills/debts:', err);
    }
  };

  const handleAddStart = () => {
    setAddingBill(true);
    setAddForm({
      name: '',
      amount: '',
      dueDate: '',
      frequency: 'monthly',
      category: 'utilities',
      notes: '',
    });
  };

  const handleAddCancel = () => {
    setAddingBill(false);
  };

  const handleAddSave = async () => {
    if (!addForm.name || !addForm.amount || !addForm.dueDate) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user?.id) return;

      const userId = user.user.id;

      // Save to Supabase
      const { error } = await supabase
        .from('bills')
        .insert({
          user_id: userId,
          name: addForm.name,
          amount: parseFloat(addForm.amount),
          due_date: addForm.dueDate,
          frequency: addForm.frequency,
          category: addForm.category,
          notes: addForm.notes,
          status: 'active',
        });

      if (error) {
        console.error('Error creating bill:', error);
        alert('Error creating bill: ' + (error.message || JSON.stringify(error)));
        return;
      }

      // Reload bills
      await loadBillsAndDebts();
      setAddingBill(false);
    } catch (err) {
      console.error('Error creating bill:', err);
    }
  };

  const handleEditStart = (item) => {
    const isDebt = item._isDebt;
    setEditingBill(item.id || item._originalId);
    setEditForm({
      name: item.name,
      amount: item.amount || item.minimumPayment,
      dueDate: item.due_date || item.dueDate,
      frequency: item.frequency,
      category: item.category,
      notes: item.notes || '',
      isDebt,
      originalId: item._originalId,
    });
  };

  const handleEditSave = async () => {
    if (editingBill) {
      try {
        const isDebt = editForm.isDebt;
        const originalId = editForm.originalId;
        
        if (isDebt) {
          // Save debt to Supabase
          const { error } = await supabase
            .from('debts')
            .update({
              name: editForm.name,
              minimum_payment: parseFloat(editForm.amount),
              due_date: editForm.dueDate,
              notes: editForm.notes,
            })
            .eq('id', originalId);
          
          if (error) {
            console.error('Error updating debt:', error);
            alert('Error saving debt: ' + (error.message || JSON.stringify(error)));
            return;
          }
          
          // Update local store
          updateDebt(originalId, {
            name: editForm.name,
            minimumPayment: parseFloat(editForm.amount),
            dueDate: editForm.dueDate,
            notes: editForm.notes,
          });
        } else {
          // Save bill to Supabase
          const { error } = await supabase
            .from('bills')
            .update({
              name: editForm.name,
              amount: parseFloat(editForm.amount),
              due_date: editForm.dueDate,
              frequency: editForm.frequency,
              category: editForm.category,
              notes: editForm.notes,
            })
            .eq('id', editingBill);
          
          if (error) {
            console.error('Error updating bill:', error);
            alert('Error saving bill: ' + (error.message || JSON.stringify(error)));
            return;
          }
          
          // Update local store
          updateBill(editingBill, {
            name: editForm.name,
            amount: parseFloat(editForm.amount),
            due_date: editForm.dueDate,
            dueDate: editForm.dueDate,
            frequency: editForm.frequency,
            category: editForm.category,
            notes: editForm.notes,
          });
        }
        
        setEditingBill(null);
      } catch (err) {
        console.error('Error saving:', err);
      }
    }
  };

  const handleEditCancel = () => {
    setEditingBill(null);
  };

  const handleCashEdit = () => {
    setEditingCash(true);
    setCashInput(cashOnHand.toString());
  };

  const handleCashSave = () => {
    const newCash = parseFloat(cashInput);
    if (!isNaN(newCash)) {
      setCashOnHand(newCash);
      setEditingCash(false);
    }
  };

  const handleCashCancel = () => {
    setEditingCash(false);
  };

  const handleDelete = async (itemId, isDebt, originalId) => {
    if (!confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      if (isDebt) {
        // Delete debt from Supabase
        const { error } = await supabase
          .from('debts')
          .delete()
          .eq('id', originalId);
        
        if (error) {
          console.error('Error deleting debt:', error);
          alert('Error deleting debt: ' + (error.message || JSON.stringify(error)));
          return;
        }
        
        // Update local store
        deleteDebt(originalId);
      } else {
        // Delete bill from Supabase
        const { error } = await supabase
          .from('bills')
          .delete()
          .eq('id', itemId);
        
        if (error) {
          console.error('Error deleting bill:', error);
          alert('Error deleting bill: ' + (error.message || JSON.stringify(error)));
          return;
        }
        
        // Update local store
        deleteBill(itemId);
      }
    } catch (err) {
      console.error('Error deleting item:', err);
    }
  };

  // Convert debts to bill-like format for display (minimum payment due dates)
  const debtItems = debts.map(debt => ({
    id: `debt-${debt.id}`,
    _originalId: debt.id,
    _isDebt: true,
    name: `${debt.name} (min payment)`,
    amount: debt.minimumPayment,
    due_date: debt.dueDate,
    dueDate: debt.dueDate,
    frequency: 'monthly',
    category: 'debt',
    notes: `Debt: ${debt.name}`,
    status: 'active',
    lastPaid: debt.lastPaid,
  }));

  // Merge bills and debt minimum payments
  const allItems = [...bills, ...debtItems];

  // Expand weekly bills to show all occurrences in next 30 days
  const expandedBills = allItems.flatMap(bill => {
    if (bill.frequency === 'weekly') {
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const targetDayName = bill.due_date || bill.dueDate;
      const targetDayIndex = dayNames.indexOf(targetDayName);
      
      if (targetDayIndex === -1) return [bill]; // Fallback if invalid day
      
      const today = new Date();
      const occurrences = [];
      
      // Generate 5 upcoming occurrences of this day
      for (let i = 0; i < 5; i++) {
        const nextDate = new Date(today);
        const currentDayIndex = nextDate.getDay();
        const daysToAdd = (targetDayIndex - currentDayIndex + 7 * (i + (targetDayIndex <= currentDayIndex ? 1 : 0))) % (7 * 5);
        nextDate.setDate(nextDate.getDate() + daysToAdd);
        
        occurrences.push({
          ...bill,
          id: `${bill.id}-${i}`,
          _originalId: bill.id,
          _dueDate: nextDate,
          _daysUntil: Math.floor((nextDate - today) / (1000 * 60 * 60 * 24)),
        });
      }
      
      return occurrences;
    }
    return [bill];
  });

  // Sort bills by due date (earliest first)
  const sortedBills = expandedBills.sort((a, b) => {
    const aDaysUntil = a._daysUntil !== undefined ? a._daysUntil : (parseInt(a.due_date || a.dueDate || 99) - new Date().getDate());
    const bDaysUntil = b._daysUntil !== undefined ? b._daysUntil : (parseInt(b.due_date || b.dueDate || 99) - new Date().getDate());
    return aDaysUntil - bDaysUntil;
  });

  const handlePayBill = async (itemId, isDebt, originalId) => {
    console.log('handlePayBill called with:', { itemId, isDebt, originalId });
    try {
      const now = new Date().toISOString();
      console.log('Saving payment with timestamp:', now);
      
      if (isDebt) {
        console.log('Updating debt:', originalId);
        // Save debt payment to Supabase
        const { error, data } = await supabase
          .from('debts')
          .update({ last_paid: now })
          .eq('id', originalId);
        
        console.log('Supabase response:', { error, data });
        
        if (error) {
          console.error('Error marking debt as paid:', error);
          alert('Error: ' + (error.message || JSON.stringify(error)));
          return;
        }
        
        console.log('Update successful, updating store...');
        // Update local store
        updateDebt(originalId, { lastPaid: now });
        console.log('Store updated');
        
        // Refetch to ensure UI updates
        console.log('Refetching debt...');
        const { data: updatedDebt, error: fetchError } = await supabase
          .from('debts')
          .select('*')
          .eq('id', originalId)
          .single();
        
        console.log('Refetch result:', { updatedDebt, fetchError });
        
        if (updatedDebt) {
          console.log('Updating store with refetched data');
          updateDebt(originalId, {
            lastPaid: updatedDebt.last_paid,
            balance: parseFloat(updatedDebt.amount) || 0,
            minimumPayment: parseFloat(updatedDebt.minimum_payment) || 0,
          });
          console.log('Store update complete');
        }
        
        // Trigger full refetch to force component re-render
        console.log('Triggering full data refetch...');
        await loadBillsAndDebts();
      } else {
        console.log('Updating bill:', itemId);
        // Save bill payment to Supabase using status column
        const { error, data } = await supabase
          .from('bills')
          .update({ status: 'completed' })
          .eq('id', itemId);
        
        console.log('Supabase response:', { error, data });
        
        if (error) {
          console.error('Error marking bill as paid:', error);
          alert('Error: ' + (error.message || JSON.stringify(error)));
          return;
        }
        
        // Update local store
        updateBill(itemId, { lastPaid: now, status: 'completed' });
        
        // Refetch to ensure UI updates
        const { data: updatedBill } = await supabase
          .from('bills')
          .select('*')
          .eq('id', itemId)
          .single();
        
        if (updatedBill) {
          updateBill(itemId, {
            lastPaid: updatedBill.last_paid,
            status: updatedBill.status,
          });
        }
        
        // Trigger full refetch to force component re-render
        await loadBillsAndDebts();
      }
    } catch (err) {
      console.error('Error marking item as paid:', err);
    }
  };

  const handleMarkUnpaid = async (itemId, isDebt, originalId) => {
    try {
      if (isDebt) {
        // Clear debt payment in Supabase
        const { error } = await supabase
          .from('debts')
          .update({ last_paid: null })
          .eq('id', originalId);
        
        if (error) {
          console.error('Error marking debt as unpaid:', error);
          alert('Error: ' + (error.message || JSON.stringify(error)));
          return;
        }
        
        // Update local store
        updateDebt(originalId, { lastPaid: null });
      } else {
        // Save to Supabase - set status back to active
        const { error } = await supabase
          .from('bills')
          .update({ status: 'active' })
          .eq('id', itemId);
        
        if (error) {
          console.error('Error marking bill as unpaid:', error);
          alert('Error: ' + (error.message || JSON.stringify(error)));
          return;
        }
        
        // Update local store
        updateBill(itemId, { lastPaid: null, status: 'active' });
      }
    } catch (err) {
      console.error('Error marking item as unpaid:', err);
    }
  };

  // Get unpaid bills and debts (status should be 'active' or not 'completed')
  const unpaidBills = sortedBills.filter(bill => bill.status !== 'completed' && bill.status !== 'paused');
  const totalUnpaid = unpaidBills.reduce((sum, bill) => sum + (bill.amount || 0), 0);
  
  // Calculate remaining after bills
  const remainingAfterBills = cashOnHand - totalUnpaid;

  // Calculate Erin settlement (shared bills tracker) - exclude debts
  const billsOnly = sortedBills.filter(bill => !bill._isDebt);
  const sharedBills = billsOnly.filter(bill => bill.notes && bill.notes.includes('(shared)'));
  const benPaysBills = sharedBills.filter(bill => !bill.notes.includes('Erin pays'));
  const erinPaysBills = billsOnly.filter(bill => bill.notes && bill.notes.includes('(shared - Erin pays)'));
  
  const benPaysTotal = benPaysBills.reduce((sum, bill) => sum + (bill.amount || 0), 0);
  const erinPaysTotal = erinPaysBills.reduce((sum, bill) => sum + (bill.amount || 0), 0);
  const benOwesErin = erinPaysTotal / 2;
  const erinOwesBen = benPaysTotal - benOwesErin;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold chaos-text">📋 MANAGE BILLS</h1>
        <button onClick={handleAddStart} className="chaos-button text-sm">➕ Add Bill</button>
      </div>

      {/* Unpaid Bills Summary */}
      {unpaidBills.length > 0 && (
        <div className="chaos-card border-2 border-orange-500 bg-orange-900/20">
          <h2 className="text-xl font-bold text-orange-400 mb-4">⚠️ UNPAID BILLS ({unpaidBills.length})</h2>
          
          {/* Cash Summary */}
          <div className="grid grid-cols-3 gap-3 mb-4 text-sm">
            <div className="bg-vibe-dark/50 p-3 rounded border border-green-500/30 relative group cursor-pointer">
              <div className="text-green-400 font-bold">💰 Cash on Hand</div>
              <div className="text-green-300 text-lg font-bold">{formatCurrency(cashOnHand)}</div>
              <button
                onClick={handleCashEdit}
                className="absolute top-1 right-1 text-green-400 opacity-0 group-hover:opacity-100 transition-opacity text-xs"
              >
                ✏️
              </button>
            </div>
            <div className="bg-vibe-dark/50 p-3 rounded border border-orange-500/30">
              <div className="text-orange-400 font-bold">📋 Total Unpaid</div>
              <div className="text-orange-300 text-lg font-bold">{formatCurrency(totalUnpaid)}</div>
            </div>
            <div className={`bg-vibe-dark/50 p-3 rounded border ${remainingAfterBills >= 0 ? 'border-yellow-500/30' : 'border-red-500/30'}`}>
              <div className={remainingAfterBills >= 0 ? 'text-yellow-400 font-bold' : 'text-red-400 font-bold'}>
                Remaining
              </div>
              <div className={`text-lg font-bold ${remainingAfterBills >= 0 ? 'text-yellow-300' : 'text-red-300'}`}>
                {formatCurrency(remainingAfterBills)}
              </div>
            </div>
          </div>
          
          <div className="space-y-2 text-sm">
            {unpaidBills.map((bill) => {
              const daysUntil = bill._daysUntil !== undefined ? bill._daysUntil : calculateDaysUntilDue(bill.due_date || bill.dueDate || 1, bill.frequency);
              const status = getDueStatus(daysUntil, bill.lastPaid, bill.frequency, bill.status);
              return (
                <div key={bill.id} className="flex justify-between items-center text-gray-300">
                  <div>
                    <span className="font-bold">{bill.name}</span>
                    <span className="text-gray-400 ml-2">
                      {bill.frequency === 'weekly' ? `Every ${bill.due_date || bill.dueDate}` : `Day ${bill.due_date || bill.dueDate}`}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-orange-300">{formatCurrency(bill.amount)}</span>
                    {daysUntil < 0 ? (
                      <span className="text-red-400 ml-3">OVERDUE</span>
                    ) : daysUntil === 0 ? (
                      <span className="text-orange-400 ml-3">DUE TODAY</span>
                    ) : (
                      <span className="text-yellow-400 ml-3">in {daysUntil} days</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Erin Settlement Tracker */}
      <div className="chaos-card border-2 border-purple-500 bg-purple-900/20">
        <h2 className="text-xl font-bold text-purple-400 mb-4">👯 ERIN SETTLEMENT</h2>
        
        <div className="grid grid-cols-3 gap-3 mb-4 text-sm">
          <div className="bg-vibe-dark/50 p-3 rounded border border-orange-500/30">
            <div className="text-orange-400 font-bold">Ben Contribution (shared)</div>
            <div className="text-orange-300 text-lg font-bold">{formatCurrency(benPaysTotal)}</div>
          </div>
          <div className="bg-vibe-dark/50 p-3 rounded border border-blue-500/30">
            <div className="text-blue-400 font-bold">Ben Verizon Shared Cost</div>
            <div className="text-blue-300 text-lg font-bold">{formatCurrency(benOwesErin)}</div>
          </div>
          <div className={`bg-vibe-dark/50 p-3 rounded border ${erinOwesBen >= 0 ? 'border-green-500/30' : 'border-red-500/30'}`}>
            <div className={erinOwesBen >= 0 ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
              Erin Shared Bills Running Total
            </div>
            <div className={`text-lg font-bold ${erinOwesBen >= 0 ? 'text-green-300' : 'text-red-300'}`}>
              {formatCurrency(erinOwesBen)}
            </div>
          </div>
        </div>

        <div className="space-y-1 text-xs text-gray-400">
          <div>• Ben contribution (shared): {formatCurrency(benPaysTotal)}</div>
          <div>• Erin pays: {formatCurrency(erinPaysTotal)}</div>
          <div>• Ben Verizon shared cost: {formatCurrency(benOwesErin)}</div>
          <div>• <span className="font-bold text-purple-300">Net: Erin shared bills running total {formatCurrency(erinOwesBen)}</span></div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {sortedBills.length === 0 ? (
          <div className="chaos-card text-center py-8 text-gray-400">
            No bills yet. Add your first bill to get started!
          </div>
        ) : (
          sortedBills.map((bill) => {
            const daysUntil = bill._daysUntil !== undefined ? bill._daysUntil : calculateDaysUntilDue(bill.due_date || bill.dueDate || 1, bill.frequency);
            const status = getDueStatus(daysUntil, bill.lastPaid, bill.frequency, bill.status);
            const isDebt = bill._isDebt;
            
            return (
              <div key={bill.id} className={`chaos-card ${isDebt ? 'border-l-4 border-red-500' : ''}`}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white">
                      {isDebt && '💳 '}
                      {bill.name}
                    </h3>
                    <div className="text-sm text-gray-400 mt-1">
                      {formatCurrency(bill.amount)} | {bill.frequency === 'weekly' ? `Every ${bill.due_date || bill.dueDate}` : `Due: Day ${bill.due_date || bill.dueDate}`} | {bill.frequency}
                      {isDebt && ' | Minimum Payment'}
                    </div>
                    {bill.lastPaid && (
                      <div className="text-xs text-green-400 mt-1">
                        ✓ Paid: {new Date(bill.lastPaid).toLocaleDateString()}
                      </div>
                    )}
                    <div className={`text-sm font-bold mt-2 ${status.color}`}>
                      {status.text}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditStart(bill)}
                      className="chaos-button px-3 py-1 text-sm"
                    >
                      ✏️ Edit
                    </button>
                    {bill.status === 'completed' || bill.lastPaid ? (
                      <button
                        onClick={() => handleMarkUnpaid(bill.id, isDebt, bill._originalId)}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 text-sm rounded"
                      >
                        ↩️ Undo
                      </button>
                    ) : (
                      <button
                        onClick={() => handlePayBill(bill.id, isDebt, bill._originalId)}
                        className="chaos-button px-3 py-1 text-sm"
                      >
                        💳 Pay
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(bill.id, isDebt, bill._originalId)}
                      className="text-red-400 hover:text-red-300"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Edit Cash Modal */}
      {editingCash && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="chaos-card w-full max-w-md mx-4">
            <h2 className="text-2xl font-bold chaos-text mb-4">💰 Edit Cash on Hand</h2>
            
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">Amount</label>
              <input
                type="number"
                step="0.01"
                value={cashInput}
                onChange={(e) => setCashInput(e.target.value)}
                className="w-full bg-vibe-dark border border-chaos-400 text-white px-3 py-2 rounded text-lg"
                autoFocus
              />
            </div>
            
            <div className="flex gap-2 mt-6">
              <button
                onClick={handleCashSave}
                className="flex-1 chaos-button"
              >
                ✅ Save
              </button>
              <button
                onClick={handleCashCancel}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
              >
                ❌ Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Bill/Debt Modal */}
      {editingBill && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="chaos-card w-full max-w-md mx-4">
            <h2 className="text-2xl font-bold chaos-text mb-4">
              ✏️ Edit {editForm.isDebt ? 'Debt' : 'Bill'}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-1">Bill Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full bg-vibe-dark border border-chaos-400 text-white px-3 py-2 rounded"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-1">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={editForm.amount}
                  onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                  className="w-full bg-vibe-dark border border-chaos-400 text-white px-3 py-2 rounded"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-1">Due Date (day of month or day name)</label>
                <input
                  type="text"
                  value={editForm.dueDate}
                  onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
                  className="w-full bg-vibe-dark border border-chaos-400 text-white px-3 py-2 rounded"
                  placeholder="e.g., 15 or Wednesday"
                />
              </div>
              
              {!editForm.isDebt && (
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-1">Frequency</label>
                  <select
                    value={editForm.frequency}
                    onChange={(e) => setEditForm({ ...editForm, frequency: e.target.value })}
                    className="w-full bg-vibe-dark border border-chaos-400 text-white px-3 py-2 rounded"
                  >
                    <option>monthly</option>
                    <option>bi-monthly</option>
                    <option>weekly</option>
                    <option>bi-weekly</option>
                    <option>every-56-days</option>
                  </select>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-1">Notes</label>
                <input
                  type="text"
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  className="w-full bg-vibe-dark border border-chaos-400 text-white px-3 py-2 rounded"
                />
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <button
                onClick={handleEditSave}
                className="flex-1 chaos-button"
              >
                ✅ Save
              </button>
              <button
                onClick={handleEditCancel}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
              >
                ❌ Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Bill Modal */}
      {addingBill && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="chaos-card w-full max-w-md mx-4">
            <h2 className="text-2xl font-bold chaos-text mb-4">➕ Add New Bill</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-1">Bill Name</label>
                <input
                  type="text"
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  className="w-full bg-vibe-dark border border-chaos-400 text-white px-3 py-2 rounded"
                  placeholder="e.g., Electric Bill"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-1">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={addForm.amount}
                  onChange={(e) => setAddForm({ ...addForm, amount: e.target.value })}
                  className="w-full bg-vibe-dark border border-chaos-400 text-white px-3 py-2 rounded"
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-1">Due Date (day of month or day name)</label>
                <input
                  type="text"
                  value={addForm.dueDate}
                  onChange={(e) => setAddForm({ ...addForm, dueDate: e.target.value })}
                  className="w-full bg-vibe-dark border border-chaos-400 text-white px-3 py-2 rounded"
                  placeholder="e.g., 15 or Wednesday"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-1">Frequency</label>
                <select
                  value={addForm.frequency}
                  onChange={(e) => setAddForm({ ...addForm, frequency: e.target.value })}
                  className="w-full bg-vibe-dark border border-chaos-400 text-white px-3 py-2 rounded"
                >
                  <option>weekly</option>
                  <option>bi-weekly</option>
                  <option>monthly</option>
                  <option>quarterly</option>
                  <option>yearly</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-1">Category</label>
                <select
                  value={addForm.category}
                  onChange={(e) => setAddForm({ ...addForm, category: e.target.value })}
                  className="w-full bg-vibe-dark border border-chaos-400 text-white px-3 py-2 rounded"
                >
                  <option value="housing">Housing</option>
                  <option value="utilities">Utilities</option>
                  <option value="insurance">Insurance</option>
                  <option value="subscription">Subscription</option>
                  <option value="food">Food</option>
                  <option value="transport">Transport</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-1">Notes (optional)</label>
                <input
                  type="text"
                  value={addForm.notes}
                  onChange={(e) => setAddForm({ ...addForm, notes: e.target.value })}
                  className="w-full bg-vibe-dark border border-chaos-400 text-white px-3 py-2 rounded"
                />
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <button
                onClick={handleAddSave}
                className="flex-1 chaos-button"
              >
                ✅ Add Bill
              </button>
              <button
                onClick={handleAddCancel}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
              >
                ❌ Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
