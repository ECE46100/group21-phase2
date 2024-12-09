import { Request, Response } from 'express';
import PackageService from '../services/packageService';
import { z } from 'zod';

const packageHistorySchema = z.object({
    Name: z.string(), // Replace ID with Name
});

/**
 * Function to get the history of a package
 * @param req : Request
 * @param res : Response
 * @param action : string
 * @returns 200 if the history was retrieved
 */
export default async function getHistory(req: Request, res: Response, action: string) {
  const { name } = req.params;
  if (!name) {
    res.status(400).send('Invalid request: Missing or improperly formatted ID in the request.');
    return;
  }

  if (!['UPLOAD', 'SEARCH', 'DOWNLOAD', 'RATE'].includes(action)) {
    res.status(400).send(`Invalid action: ${action}. Allowed actions are UPLOAD, SEARCH, DOWNLOAD, RATE.`);
    return;
  }

  try {
    const history = await PackageService.getPackageHistory(name, action);
    res.status(200).json(history);
  } catch (error) {
    console.error(`Error getting ${action} history of package ${name}:`, error);
    res.status(500).send(`Error getting ${action} history of package ${name}.`);
  }
}