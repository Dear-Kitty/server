import { Request, Response, NextFunction } from 'express';
import { admin } from '../config/firebaseAdmin';
import { StatusCodes } from 'http-status-codes';

const authenticateFirebaseToken = async (req: Request, res: Response, next: NextFunction) => {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Authorization 헤더가 누락되었거나 잘못된 형식입니다.' });
    return;
  }

  const [, token] = authorization.split('Bearer ');

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.uid = decodedToken.uid;
    next();
  } catch (err) {
    console.error('토큰 검증 중 오류가 발생했습니다.', err);
    res.status(StatusCodes.UNAUTHORIZED).json({
      message: '유효하지 않거나 이미 만료된 토큰입니다.',
    });
  }
};

export default authenticateFirebaseToken;
