import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { db } from '../config/firebaseAdmin';
import openai from '../config/openai';

export const createUser = async (req: Request, res: Response) => {
  try {
    const uid = req.uid!;
    const { nickname, kittyname, age, job } = req.body;

    const kittyId = await createAssistant(kittyname);

    const data = {
      nickname: nickname,
      kittyId: kittyId,
      age: age,
      job: job,
      created_at: Date.now(),
    };
    await db.collection('user').doc(uid).set(data);

    res.status(StatusCodes.CREATED).json({
      message: '사용자가 성공적으로 생성되었습니다.',
    });
  } catch (err) {
    console.error('쿼리 실행 중 오류 발생', (err as Error).stack);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: `사용자 생성 중 오류가 발생했습니다: ${(err as Error).message}`,
    });
  }
};

export const getUser = async (req: Request, res: Response) => {
  try {
    const uid = req.uid!;

    const userData = await db.collection('user').doc(uid).get();

    if (!userData.exists) {
      res.status(StatusCodes.NOT_FOUND).json({
        message: '사용자를 찾을 수 없습니다.',
      });

      return;
    }

    res.status(StatusCodes.OK).json({
      message: '사용자 데이터를 성공적으로 가져왔습니다.',
      data: userData,
    });
  } catch (err) {
    console.error('쿼리 실행 중 오류 발생', (err as Error).stack);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: `사용자 데이터를 가져오는 중 오류가 발생했습니다: ${(err as Error).message}`,
    });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const uid = req.uid!;
    const { nickname, age, job } = req.body;
    const data = {
      nickname: nickname,
      age: age,
      job: job,
      // picURL 추후 추가
    };

    await db.collection('user').doc(uid).update(data);

    res.status(StatusCodes.CREATED).json({
      message: '사용자 정보가 성공적으로 갱신되었습니다.',
    });
  } catch (err) {
    console.error('쿼리 실행 중 오류 발생', (err as Error).stack);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: `사용자 정보 갱신 중 오류가 발생했습니다: ${(err as Error).message}`,
    });
  }
};

const createAssistant = async (kittyname: string) => {
  const myAssistant = await openai.beta.assistants.create({
    instructions:
      'You are both my American friend, and personal English tutor. When I speak English sentences, you have to correct them with the correct expressions.',
    name: kittyname,
    model: 'gpt-4o',
  });

  return myAssistant.id;
};
