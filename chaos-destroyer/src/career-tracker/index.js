/**
 * Career Progression Tracker
 *
 * This tool helps Ben track his career growth and skills learned.
 */

import { v4 as uuidv4 } from 'uuid';

class CareerTracker {
  constructor() {
    this.entries = [];
  }

  addEntry(jobTitle, company, startDate, endDate) {
    const entry = {
      id: uuidv4(),
      jobTitle,
      company,
      startDate,
      endDate,
    };

    this.entries.push(entry);

    return entry;
  }

  getEntries() {
    return this.entries;
  }

  updateEntry(id, updatedFields) {
    const index = this.entries.findIndex((entry) => entry.id === id);
    if (index !== -1) {
      Object.assign(this.entries[index], updatedFields);
    }
  }

  deleteEntry(id) {
    const index = this.entries.findIndex((entry) => entry.id === id);
    if (index !== -1) {
      this.entries.splice(index, 1);
    }
  }
}

export default CareerTracker;
