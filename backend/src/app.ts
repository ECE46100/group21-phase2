import { Router, Response } from 'express';
import { Request } from 'express-serve-static-core';

import authenticate from './controllers/authenticate';
import searchPackages from './controllers/searchPackages';
import searchByRegEx from './controllers/searchByRegEx';
import uploadPackage from './controllers/uploadPackage';
import updatePackage from './controllers/updatePackage';
import ratePackage from './controllers/ratePackage';
import downloadPackage from './controllers/downloadPackage';
import reset from './controllers/reset';

import { authMiddleware, permMiddleware } from './middleware/auth_middleware';

const router = Router();

router.post('/packages', authMiddleware, permMiddleware, async (req: Request, res: Response) => {
  if (!req.middleware.permissions.searchPerm && !req.middleware.permissions.adminPerm) {
    res.status(401).send('Unauthorized - missing permissions');
    return;
  }
  return await searchPackages(req, res);
});


router.post('/package/byRegEx', authMiddleware, permMiddleware, async (req: Request, res: Response) => {
  if (!req.middleware.permissions.searchPerm && !req.middleware.permissions.adminPerm) {
    res.status(401).send('Unauthorized - missing permissions');
    return;
  }
  return await searchByRegEx(req, res);
});

router.delete('/reset', authMiddleware, permMiddleware, async (req: Request, res: Response) => {
  if (!req.middleware.permissions.adminPerm) {
    res.status(401).send('Unauthorized - missing permissions');
    return;
  }
  return await reset(req, res);
});


router.get('/package/:id', authMiddleware, permMiddleware, async (req: Request, res: Response) => {
  if (!req.middleware.permissions.downloadPerm && !req.middleware.permissions.adminPerm) {
    res.status(401).send('Unauthorized - missing permissions');
    return;
  }
  return await downloadPackage(req, res);
});

router.post('/package/:id', authMiddleware, permMiddleware, async (req: Request, res: Response) => {
  if (!req.middleware.permissions.downloadPerm && !req.middleware.permissions.adminPerm) {
    res.status(403).send('Unauthorized - missing permissions');
    return;
  }
  return await updatePackage(req, res);
});


router.post('/package', authMiddleware, permMiddleware, async (req: Request, res: Response) => {
  if (!req.middleware.permissions.uploadPerm && !req.middleware.permissions.adminPerm) {
    res.status(401).send('Unauthorized - missing permissions');
    return;
  }
  return await uploadPackage(req, res);
});


router.get('/package/:id/rate', authMiddleware, permMiddleware, async (req: Request, res: Response) => {
  if (!req.middleware.permissions.downloadPerm && !req.middleware.permissions.adminPerm) {
    res.status(403).send('Unauthorized - missing permissions');
    return;
  }
  return await ratePackage(req, res);
});


router.post('/package/:id/cost', authMiddleware, permMiddleware, async (req: Request, res: Response) => {
  const id = req.params.id;
  // TODO: Implement the logic to calculate the cost of the package by id
  res.status(501).send('Not implemented');
  return;
});

router.put('/authenticate', async (req: Request, res: Response) => {
  return await authenticate(req, res);
});

router.post('/package/byRegEx', authMiddleware, permMiddleware, async (req: Request, res: Response) => {
  // TODO: Implement the logic to fetch the packages by regular expression from the database
  if (!req.middleware.permissions.searchPerm && !req.middleware.permissions.adminPerm) {
    res.status(403).send('Unauthorized - missing permissions');
    return;
  }
  return await searchByRegEx(req, res);
});

router.get('/tracks', (req: Request, res: Response) => {
  const trackObject = {
    plannedTracks: [
      "Access control track",
    ]
  }
  res.status(200).send(trackObject);
  return;
});

router.delete('/deleteUser', (req: Request, res: Response) => {
  // TODO: Implement the logic to delete the user
});

router.post('/createUser', (req: Request, res: Response) => {
  // TODO: Implement the logic to create the user
});

router.get('/uploadHistory/:id', (req: Request, res: Response) => {
  // TODO: Implement the logic to fetch the upload history by id
});

router.get('/downloadHistory/:id', (req: Request, res: Response) => {
  // TODO: Implement the logic to fetch the upload history by id
});

export default router;