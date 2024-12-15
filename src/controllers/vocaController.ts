import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { db } from '../config/firebaseAdmin';

export const addVoca = async (req: Request, res: Response) => {
  try {
    const uid = req.uid!;
    const data = {
      user_id: uid,
      chat_id: req.body.chatId,
      word: req.body.word,
      meaning: req.body.meaning,
      created_at: Date.now(),
      //status
    };

    await db.collection('voca').add(data);

    res.status(StatusCodes.CREATED).json({
      message: '단어가 성공적으로 저장되었습니다.',
    });
  } catch (err) {
    console.error('쿼리 실행 중 오류 발생', (err as Error).stack);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: `단어 저장 중 오류가 발생했습니다: ${(err as Error).message}`,
    });
  }
};

//전체 단어 목록
export const getAllVoca = async (req: Request, res: Response) => {
  try {
    const uid = req.uid!;

    const data = await db.collection('voca').select('chatId', 'word', 'meaning').where('user_id', '==', uid).get();

    if (data.empty) {
      res.status(StatusCodes.NOT_FOUND).json({
        message: '단어를 찾을 수 없습니다.',
      });

      return;
    }
    const results: { id: string; word: string; meaning: string }[] = [];

    data.forEach((doc) => {
      results.push({ id: doc.id, word: doc.data().word, meaning: doc.data().meaning });
    });
    res.status(StatusCodes.OK).json({
      message: '전체 단어를 성공적으로 가져왔습니다.',
      results,
    });
  } catch (err) {
    console.error('쿼리 실행 중 오류 발생', (err as Error).stack);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: `전체 단어 데이터를 가져오는 중 오류가 발생했습니다: ${(err as Error).message}`,
    });
  }
};

//날짜별 단어장 목록
export const getVocaByDateList = async (req: Request, res: Response) => {
  try {
    const uid = req.uid!;

    const data = await db
      .collection('chat')
      .select('chat_id', 'topic', 'created_at')
      .where('user_id', '==', uid)
      .orderBy('created_at', 'desc')
      .get();

    if (data.empty) {
      res.status(StatusCodes.NOT_FOUND).json({
        message: '단어장을 찾을 수 없습니다.',
      });

      return;
    }
    const results: { id: string; topic: string; created_at: string }[] = [];

    data.forEach((doc) => {
      results.push({ id: doc.id, topic: doc.data().topic, created_at: doc.data().created_at });
    });

    res.status(StatusCodes.OK).json({
      message: '날짜별 단어장 목록을 성공적으로 가져왔습니다.',
      results,
    });
  } catch (err) {
    console.error('쿼리 실행 중 오류 발생', (err as Error).stack);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: `날짜별 단어장 데이터를 가져오는 중 오류가 발생했습니다: ${(err as Error).message}`,
    });
  }
};

//날짜별 단어 목록
export const getVocaByDate = async (req: Request, res: Response): Promise<void> => {
  try {
    const created_at = req.params.created_at;

    const chatData = await db
      .collection('chat')
      .select('chat_id', 'created_at')
      .where('created_at', '==', created_at)
      .get();

    if (chatData.empty) {
      res.status(StatusCodes.NOT_FOUND).json({
        message: '단어장을 찾을 수 없습니다.',
      });
      return;
    }

    const chatId: string[] = chatData.docs.map((doc) => doc.id);

    if (chatId.length === 0) {
      res.status(StatusCodes.NOT_FOUND).json({
        message: 'chat_id를 찾을 수 없습니다.',
      });
      return;
    }

    const vocaByDateData = await db.collection('voca').where('chat_id', 'in', chatId).get();
    // where 방식 논의 후 결정

    if (vocaByDateData.empty) {
      res.status(StatusCodes.NOT_FOUND).json({
        message: '조건에 맞는 voca 데이터를 찾을 수 없습니다.',
      });
      return;
    }

    const vocaData = vocaByDateData.docs.map((doc) => ({
      chat_id: doc.data().chat_id,
      word: doc.data().word,
      meaning: doc.data().meaning,
    }));

    res.status(StatusCodes.OK).json({
      message: '단어를 성공적으로 가져왔습니다.',
      data: vocaData,
    });
  } catch (err) {
    console.error('쿼리 실행 중 오류 발생', (err as Error).stack);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: `날짜별 단어 데이터를 가져오는 중 오류가 발생했습니다: ${(err as Error).message}`,
    });
  }
};
