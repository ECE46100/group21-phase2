import { Request, Response } from 'express';
import UserService from '../services/userService';
import { z } from 'zod';

const userCreationSchema = z.object({
    username: z.string(),
    password: z.string(),
    uploadPerm: z.boolean(),
    downloadPerm: z.boolean(),
    searchPerm: z.boolean(),
    adminPerm: z.boolean(),
    userGroup: z.string(),
  });

/**
 * Function to create a new user
 * @param req : Request
 * @param res : Response
 * @returns 200 if the user was created
 */
export default async function createUser(req: Request, res: Response) {
    const validationResult = userCreationSchema.safeParse(req.body);
    if (!validationResult.success || validationResult.data.password=='' || validationResult.data.username=='') {
      res.status(400).send('There is missing field(s) in the new user data or it is formed improperly, or is invalid.');
      return;
    }
    if (await UserService.getUser(validationResult.data.username)) {
        res.status(400).send('This username is taken, please choose a different name.');
        return;
    }
    try {
        await UserService.createUser(validationResult.data);
        res.status(200).send('New user created.');
    } catch (error) {
        console.error('Error creating new user:', error);
        res.status(500).send('Error creating new user.');
    }
    return;
}
