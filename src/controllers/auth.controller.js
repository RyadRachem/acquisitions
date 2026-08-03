import { signupSchema } from '#validations/auth.validation.js';
import { formatValidationError } from '#utils/format.js';
import logger from '#config/logger.js';
import { createUser } from '#services/auth.service.js';
import { cookies } from '#utils/cookies.js';
import { jwttoken } from '#utils/jwt.js';

export const signup = async (req, res, next) => {
  try {
    const validationResult = signupSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        error: 'validation failed',
        details: formatValidationError(validationResult.error),
      });
    }

    const { name, password, email, role } = validationResult.data;

    const user = await createUser({ name, email, password, role });

    const token = jwttoken.sign({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    cookies.set(res, 'token', token);

    //auth service
    logger.info(
      `User ${name} with email ${email} and role ${role} signed up successfully.`
    );
    res.status(201).json({
      message: 'user registered',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (e) {
    logger.error('Signup error', e);
    if (e.message === 'User with this email already exists') {
      return res.status(409).json({ error: 'Email already exist ' });
    }
    next(e);
  }
};
