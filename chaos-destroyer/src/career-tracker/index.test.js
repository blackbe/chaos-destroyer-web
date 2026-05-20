/**
 * Unit tests for the career tracker
 */

import CareerTracker from './index.js';

describe('CareerTracker', () => {
  it('should create a new entry', async () => {
    const tracker = new CareerTracker();
    const entry = await tracker.addEntry(
      'Software Engineer',
      'ABC Inc.',
      '2020-01-01',
      '2022-12-31'
    );

    expect(entry.id).toBe(uuidv4());
    expect(entry.jobTitle).toBe('Software Engineer');
    expect(entry.company).toBe('ABC Inc.');
    expect(entry.startDate).toBe('2020-01-01');
    expect(entry.endDate).toBe('2022-12-31');
  });

  it('should retrieve all entries', async () => {
    const tracker = new CareerTracker();
    for (const entry of sampleData) {
      await tracker.addEntry(entry.jobTitle, entry.company, entry.startDate, entry.endDate);
    }

    expect(tracker.getEntries()).toEqual(sampleData.map((entry) => ({ ...entry })));
  });

  it('should update an entry', async () => {
    const tracker = new CareerTracker();
    const entry = await tracker.addEntry(
      'Software Engineer',
      'ABC Inc.',
      '2020-01-01',
      '2022-12-31'
    );

    await tracker.updateEntry(entry.id, { endDate: '2025-12-31' });

    expect(tracker.getEntries()).toEqual([
      {
        id: entry.id,
        jobTitle: 'Software Engineer',
        company: 'ABC Inc.',
        startDate: '2020-01-01',
        endDate: '2025-12-31',
      },
    ]);
  });

  it('should delete an entry', async () => {
    const tracker = new CareerTracker();
    const entry = await tracker.addEntry(
      'Software Engineer',
      'ABC Inc.',
      '2020-01-01',
      '2022-12-31'
    );

    await tracker.deleteEntry(entry.id);

    expect(tracker.getEntries()).toEqual([]);
  });
});
