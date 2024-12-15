import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import OpenAI from 'openai';
import { db } from '../config/firebaseAdmin';
import openai from '../config/openAI';
import { Content } from '../types/chat';
import { FieldValue } from 'firebase-admin/firestore';

export const createThread = async (req: Request, res: Response) => {
  try {
    const uid = req.uid!;

    const userData = await db.collection('user').doc(uid).get();
    const kittyId = userData.get('kitty_id');
    const assistant = await openai.beta.assistants.retrieve(kittyId);

    const thread = await openai.beta.threads.create();

    const data = {
      user_id: uid,
      created_at: Date.now(),
    };

    db.collection('chat').doc(thread.id).set(data);

    res.status(StatusCodes.CREATED).json({
      threadId: thread.id,
      assistantId: assistant.id,
    });
  } catch (err) {
    console.error('쿼리 실행 중 오류 발생', (err as Error).stack);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: `스레드를 생성하던 중 오류가 발생했습니다: ${(err as Error).message}`,
    });
  }
};

export const chat = async (req: Request, res: Response) => {
  try {
    const uid = req.uid!;
    const { threadId, assistantId, prompt } = req.body;
    await db
      .collection('chat')
      .doc(threadId)
      .update({
        chat: FieldValue.arrayUnion(prompt),
      });
    await openai.beta.threads.messages.create(threadId, {
      role: 'user',
      content: prompt,
    });

    var answer = await getChat(threadId, assistantId);

    if (answer.endsWith('[topic]')) {
      answer = answer.split('[')[0];
      const topic = answer.split(`"`)[1].replace(`"`, ``);
      db.collection('chat').doc(threadId).set(
        {
          topic: topic,
        },
        { merge: true },
      );
    }

    if (answer.endsWith('[voca]')) {
      answer = answer.split('[')[0];
      const vocaList = answer.split('복습해야 할 단어\n')[1];
      addVocaFromChat(vocaList, threadId, uid);
    }

    await db
      .collection('chat')
      .doc(threadId)
      .update({
        chat: FieldValue.arrayUnion(answer),
      });

    res.status(StatusCodes.OK).json({
      kitty: answer, // kitty 이름 변경해야 됨
    });
  } catch (err) {
    console.error('쿼리 실행 중 오류 발생', (err as Error).stack);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: `대화를 진행하던 중 오류가 발생했습니다: ${(err as Error).message}`,
    });
  }
};

export const getChatList = async (req: Request, res: Response) => {
  try {
    const uid = req.uid!;

    const data = await db.collection('chat').select('created_at', 'topic').where('user_id', '==', uid).get();
    if (data.empty) {
      res.status(StatusCodes.NOT_FOUND).json({
        message: '대화 기록을 찾을 수 없습니다.',
      });

      return;
    }

    const results: { chatId: string; createdAt: string; topic: string }[] = [];
    data.forEach((doc) => {
      const date = new Date(doc.data().created_at);
      const dateToString = date.getFullYear() + '/' + date.getMonth() + '/' + date.getDate();

      results.push({ chatId: doc.id, createdAt: dateToString, topic: doc.data().topic });
    });

    res.status(StatusCodes.OK).json({
      message: '전체 대화 내역을 성공적으로 가져왔습니다.',
      results,
    });
  } catch (err) {
    console.error('쿼리 실행 중 오류 발생', (err as Error).stack);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: `전체 대화 내역을 가져오는 중 오류가 발생했습니다: ${(err as Error).message}`,
    });
  }
};

export const getChatDetail = async (req: Request, res: Response) => {
  try {
    const chatId = 'thread_' + req.params.id;
    const data = await db.collection('chat').doc(chatId).get();

    const date = new Date(data.get('created_at'));
    const dateToString = date.getFullYear() + '/' + date.getMonth() + '/' + date.getDate();

    const results = {
      createdAt: dateToString,
      topic: data.get('topic'),
      chat: data.get('chat'),
    };

    res.status(StatusCodes.OK).json({
      message: '대화 내역을 성공적으로 가져왔습니다.',
      results,
    });
  } catch (err) {
    console.error('쿼리 실행 중 오류 발생', (err as Error).stack);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: `대화 내역을 가져오는 중 오류가 발생했습니다: ${(err as Error).message}`,
    });
  }
};

const checkRunStatus = async (client: OpenAI, threadId: string, runId: string) => {
  var run = await client.beta.threads.runs.retrieve(threadId, runId);

  while (run.status !== 'completed') {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    run = await client.beta.threads.runs.retrieve(threadId, runId);
  }
};

const getChat = async (threadId: string, assistantId: string) => {
  const run = await openai.beta.threads.runs.create(threadId, {
    assistant_id: assistantId,
  });
  await checkRunStatus(openai, threadId, run.id);

  const messages = await openai.beta.threads.messages.list(threadId);
  const content: Content[] = messages.data[0].content;
  const textValues: string[] = content
    .filter((item) => item.type === 'text' && item.text)
    .map((item) => item.text!.value);

  return textValues[0];
};

const addVocaFromChat = async (list: string, chatId: string, uid: string) => {
  const vocaList: string[] = list.split(',');
  vocaList.forEach(async (voca) => {
    const temp: string[] = voca.split('/');
    const data = {
      chat_id: chatId,
      user_id: uid,
      word: temp[0],
      meaning: temp[1],
      created_at: Date.now(),
    };
    await db.collection('voca').add(data);
  });
};
