import { Router } from 'express';
import * as journal from '../controllers/journalController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = Router();

router.get('/', journal.getJournals);
router.get('/featured', journal.getFeaturedJournals);
router.get('/:slug', journal.getJournalBySlug);
router.post('/', protect, restrictTo('admin'), journal.createJournal);
router.put('/:id', protect, restrictTo('admin'), journal.updateJournal);
router.delete('/:id', protect, restrictTo('admin'), journal.deleteJournal);

export default router;
