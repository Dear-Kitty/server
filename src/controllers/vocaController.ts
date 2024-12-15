import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { db } from '../config/firebaseAdmin';
import { firestore } from 'firebase-admin';

export const addVoca = async (req: Request, res: Response) => {
  try {
    const uid = req.uid!;
    const data = {
      chatid: req.body.chatid,
      word: req.body.word,
      meaning: req.body.meaning,
      created_at: Date.now(),
      //status
    };

    await db.collection('voca').doc(uid).set(data);

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
    const userid = req.params.userid;

    const data = await db
      .collection('voca')
      .select('chatid', 'word', 'meaning')
      .where('userid', 'array-contains', userid)
      .get();

    if (data.empty) {
      res.status(StatusCodes.NOT_FOUND).json({
        message: '단어를 찾을 수 없습니다.',
      });

      return;
    }

    res.status(StatusCodes.OK).json({
      message: '전체 단어를 성공적으로 가져왔습니다.',
      data: data,
    });
  } catch (err) {
    console.error('쿼리 실행 중 오류 발생', (err as Error).stack);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: `전체 단어 데이터를 가져오는 중 오류가 발생했습니다: ${(err as Error).message}`,
    });
  }
};

//날짜별 단어장 목록
export const getVocaByDayList = async (req: Request, res: Response) => {
  try {
    const userid = req.params.userid;

    const data = await db
      .collection('chat')
      .select('chatid', 'topic', 'created_at')
      .where('userid', 'array-contains', userid)
      .get();

    if (data.empty) {
      res.status(StatusCodes.NOT_FOUND).json({
        message: '단어장을 찾을 수 없습니다.',
      });

      return;
    }

    res.status(StatusCodes.OK).json({
      message: '날짜별 단어장 목록을 성공적으로 가져왔습니다.',
      data: data,
    });
  } catch (err) {
    console.error('쿼리 실행 중 오류 발생', (err as Error).stack);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: `날짜별 단어장 데이터를 가져오는 중 오류가 발생했습니다: ${(err as Error).message}`,
    });
  }
};

//날짜별 단어 목록
export const getVocaByDay = async (req: Request, res: Response): Promise<void> => {
  try {
    const created_at = req.params.created_at;

    if (!created_at) {
      res.status(StatusCodes.BAD_REQUEST).json({
        message: 'created_at 파라미터가 필요합니다.',
      });
      return;
    }

    const chatData = await db.collection('chat').where('created_at', '==', created_at).get();

    if (chatData.empty) {
      res.status(StatusCodes.NOT_FOUND).json({
        message: '단어장을 찾을 수 없습니다.',
      });
      return;
    }

    const chatIds = chatData.docs.map((doc) => doc.data().chatid);

    if (chatIds.length === 0) {
      res.status(StatusCodes.NOT_FOUND).json({
        message: 'chatid를 찾을 수 없습니다.',
      });
      return;
    }

    const vocaByDayListData: any[] = [];
    for (let i = 0; i < chatIds.length; i += 10) {
      const batchIds = chatIds.slice(i, i + 10);
      const vocaData = await db.collection('voca').where('chatid', 'array-contains-any', batchIds).get();

      if (!vocaData.empty) {
        const batchData = vocaData.docs.map((doc) => ({
          chatid: doc.data().chatid,
          word: doc.data().word,
          meaning: doc.data().meaning,
        }));
        vocaByDayListData.push(...batchData);
      }
    }

    if (vocaByDayListData.length === 0) {
      res.status(StatusCodes.NOT_FOUND).json({
        message: '단어를 찾을 수 없습니다.',
      });
      return;
    }

    res.status(StatusCodes.OK).json({
      message: '단어를 성공적으로 가져왔습니다.',
      data: vocaByDayListData,
    });
  } catch (err) {
    console.error('쿼리 실행 중 오류 발생', (err as Error).stack);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: `날짜별 단어 데이터를 가져오는 중 오류가 발생했습니다: ${(err as Error).message}`,
    });
  }
};
