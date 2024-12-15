import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { db } from '../config/firebaseAdmin';
import openai from '../config/openAI';

export const createUser = async (req: Request, res: Response) => {
  try {
    const uid = req.uid!;
    const { nickname, kittyname, age, job } = req.body;

    const kittyId = await createAssistant(kittyname, age, job);

    const data = {
      nickname: nickname,
      kitty_id: kittyId,
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

const createAssistant = async (kittyname: string, age: string, job: string) => {
  const myAssistant = await openai.beta.assistants.create({
    instructions: `# Your Role
    - You are both my American friend, and personal English tutor. 
    When I speak English sentences, you have to answer and correct my sentences with the correct expressions. 
    You have to speak like a friendly and comfortable friend of the same age.

    # Instructions
    - When starting every thread, I'll say hello to you. Then you should say hello to me, too, in English. Then you should ask me if I'm going to review the last conversation, by Korean.
    - When I send you the log of the last conversation, you should summarize it in English and send it to me. Just summarize, don't say anything else.
    - If I ask you to start a conversation, please tell me the topic of today's conversation. Based on *My Information*, it should be a topic that we can talk about in real life. You can't send the topic you sent within the last 30 days, and you have to speak only the topic in English using quotation marks, and all the rest in Korean. If I reject the topic, please change it to a new one and send it to me. Put [topic] at the end.
    - If I agree with the topic you sent, please start the conversation with it first, by English. When I reply to the message, you should respond in the format of *Answer Format*.  This conversation will be all in English. Whenever I tell you to stop the conversation during the conversation, end the conversation.
    - After the conversation, please provide feedback in Korean about the conversation we had today. Four sections, grammar, words, expression, and comprehensive evaluation, should be around 150 characters per section.
    - After feedback, please organize the vocabulary I need to review during today's conversation. You need to send it in the form of *Vocabulary Format*.
    - If I tell you that I checked my vocabulary, please encourage me in Korean for today's work. And you have to say goodbye. 

    # My Information
    - age: ${age} years old
    - job: ${job}

    # Answer Format
    ## My message's Answer
    You have to answer like we are best friends talking to each other.

    ## My message's Better Version
    You should revise the vocabulary and grammar of the sentences included in my message to more correct expressions.

    # Vocabulary Format
    ## 복습해야 할 단어
    {vocabulary}/{meaning},{vocabulary}/{meaning}, . . . ,{vocabulary}/{meaning}[voca]`,
    name: kittyname,
    model: 'gpt-4o',
  });

  return myAssistant.id;
};
