const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');
const auth = require("../middleware/auth");
/**
 * App Routes 
*/
router.get('/', recipeController.homepage);
router.get('/recipe/:id', recipeController.exploreRecipe );
router.get('/categories', recipeController.exploreCategories);
router.get('/categories/:id', recipeController.exploreCategoriesById);
router.post('/search', recipeController.searchRecipe);
router.get('/explore-latest', recipeController.exploreLatest);
router.get('/explore-random', recipeController.exploreRandom);
router.get('/submit-recipe',auth, recipeController.submitRecipe);
router.post('/submit-recipe',auth, recipeController.submitRecipeOnPost);

 
module.exports = router;