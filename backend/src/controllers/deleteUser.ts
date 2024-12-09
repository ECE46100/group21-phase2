import { Request, Response } from 'express';
import UserService from '../services/userService';
import { z } from 'zod';

const userDeletionSchema = z.object({
    username: z.string(),
    deleteName: z.string(),
  });

/**
 * Function to delete a user
 * @param req : Request
 * @param res : Response
 * @returns 200 if the user was deleted
 */
  export default async function deleteUser(req: Request, res: Response) {
    const validationResult = userDeletionSchema.safeParse(req.body);
    if (!validationResult.success) {
      res.status(400).send('There is missing field(s) in the request data or it is formed improperly, or is invalid.');
      return;
    }

    const {username, deleteName } = validationResult.data;
    const user = await UserService.getUser(username);
    if (!user) {
        res.status(400).send('Not a valid User');
        return;
    }
    if (!await UserService.getUser(deleteName)) {
        res.status(400).send('The user to delete does not exists.');
        return;
    }
    if (!user.adminPerm && (username!=deleteName)) {
        res.status(400).send('Only admin can delete other users. Non-admin can only delete self.');
        return;
    }
    try {
        await UserService.deleteUser(deleteName);
        res.status(200).send('User deleted successfully.');
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).send('Error deleting user.');
    }
    return;
}