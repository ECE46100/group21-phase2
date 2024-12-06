import { Request, Response } from 'express';
import UserService from '../services/userService';
import { z } from 'zod';

const userGroupCreationSchema = z.object({
    name: z.string(),
    description: z.string().optional(),
  });

export default async function createUserGroup(req: Request, res: Response) {
    const validationResult = userGroupCreationSchema.safeParse(req.body);
    if (!validationResult.success || validationResult.data.name=='') {
      res.status(400).send('The group name missing or is formed improperly, or is invalid.');
      return;
    }

    const { name, description } = validationResult.data;
    if (await UserService.getGroupByName(name)) {
        res.status(400).send('This group name is taken, please choose a different name.');
        return;
    }
    try {
        await UserService.createUserGroup(name, description);
        res.status(200).send('New user created.');
    } catch (error) {
        console.error('Error creating new user:', error);
        res.status(500).send('Error creating new user.');
    }
    return;
}
