const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { protect } = require('../middleware/auth');
const multer = require('multer');

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, 'uploads/');
	},
	filename: function (req, file, cb) {
		const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
		const safeName = file.originalname.replace(/[^a-zA-Z0-9.\-]/g, '_');
		cb(null, uniqueSuffix + '-' + safeName);
	}
});

const upload = multer({ storage });

router.get('/', protect, projectController.getProjects);
router.get('/:id', protect, projectController.getProject);
router.post('/', protect, projectController.createProject);
router.put('/:id', protect, projectController.updateProject);
router.delete('/:id', protect, projectController.deleteProject);
router.post('/:id/comment', protect, projectController.addComment);
router.post('/:id/request', protect, projectController.requestToJoin);
router.post('/:id/like', protect, projectController.likeProject);
router.post('/:id/view', protect, projectController.incrementViews);
router.post('/:id/image', protect, upload.single('image'), projectController.uploadImage);

module.exports = router;
