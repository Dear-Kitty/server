const express = require("express");
const router =express.Router();

const {
    addVoca,
    getAllVoca,
    getVocaList,
    getVocaCreatedAt
} = require("../controllers/vocaController");

//권한 설정 _middleware

router.post("/add",,addVoca);
router.get('/all', getAllVoca);
router.get('/list', getVocaList);
router.get('/list/{createdAt}', getVocaCreatedAt);

module.exports = router