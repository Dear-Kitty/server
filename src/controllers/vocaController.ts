const firebase = require('../config/firebaseAdmin');
const Voca = require('../models/voca');

const firestore = firebase.firestore();
const vocaCollection = firestore.collection('voca');

// const addVoca = async (req, res, next)=>{
//     try{
//         const data=req.body;
//         const voca=await db.collection("voca").doc().set(data);
//         res.send("Voca save successfully");
//     }catch (error){
//         res.status(400).send(error.message);
//     }
// };
export {};

const getAllVoca = (req: Request, res: Response) => {
  try {
    const snapshot = vocaCollection.select('conversation_id', 'word', 'meaning').get();

    if (snapshot.empty) {
      console.log('No matching document found.');
      return [];
    }

    const results = snapshot.docs.map((doc) => ({
      id: doc.id,
      conversation_id: doc.data().conversation_id,
      word: doc.data().word,
      meaning: doc.data().meaning,
    }));
    res.status(200);
  } catch (error) {
    res.status(404).send('Product not found');
  }
};

// const getVocaList =async(req,res)=>{
//     try{

//     }catch
// };

// const getVocaCreatedAt=async(req,res )=>{
//     try{

//     }catch
// };

module.exports = {
  getAllVoca,
};
