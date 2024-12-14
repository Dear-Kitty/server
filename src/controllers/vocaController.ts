import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { db } from '../config/firebaseAdmin';

export const addVoca = async (req: Request, res: Response) => {
  try {
    const uid = req.uid!;
    const data = {
      conversationid: req.body.conversationId,
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
    const userid = req.uid!;
    const data = await db.collection('voca').select('word').select('meaning').where('userid', '==', userid).get();

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
    const created_at = req.uid!;
    const data = await db.collection('chat').select('chatid').select('topic').select('created_at').get();

    if (data.empty) {
      res.status(StatusCodes.NOT_FOUND).json({
        message: '단어를 찾을 수 없습니다.',
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
export const getVocaByDay = async (req: Request, res: Response) => {
  try {
    const chatid = req.uid!;
    const chatData = await db.collection('chat').get();
    const vocaData = await db.collection('voca').select('word').select('meaning').where('chatid', '==', chatid).get();

    if (vocaData.empty || chatData.empty) {
      res.status(StatusCodes.NOT_FOUND).json({
        message: '단어를 찾을 수 없습니다.',
      });

      return;
    }

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
