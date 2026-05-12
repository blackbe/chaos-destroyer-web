import WestCoastSwingTracker from './index.js';

describe('West Coast Swing Tracker', () => {
    let track;

    beforeEach(() => {
        track = new WestCoastSwingTracker();
    });

    it('should display initial data', () => {
        const displayTrackerSpy = jest.spyOn(track, 'displayTracker');
        track.displayTracker();
        expect(displayTrackerSpy).toHaveBeenCalledTimes(1);
    });

    it('should add note successfully', () => {
        track.addNote("Lesson 2", "This was my second lesson.");
        const notes = track.notes;
        expect(notes.length).toBe(2);
    });
});
