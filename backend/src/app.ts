import { Router, Response } from 'express';
import { Request } from 'express-serve-static-core';

import authenticate from './controllers/authenticate';
import searchPackages from './controllers/searchPackages';
import searchByRegEx from './controllers/searchByRegEx';
import uploadPackage from './controllers/uploadPackage';
import updatePackage from './controllers/updatePackage';
import ratePackage from './controllers/ratePackage';
import downloadPackage from './controllers/downloadPackage';

import { authMiddleware, permMiddleware } from './middleware/auth_middleware';

const router = Router();

router.post('/packages', authMiddleware, permMiddleware, async (req: Request, res: Response) => {
  // console.log('in router POST /packages'); //delete me
  if (!req.middleware.permissions.searchPerm && !req.middleware.permissions.adminPerm) {
    res.status(403).send('Unauthorized - missing permissions');
    return;
  }
  return await searchPackages(req, res);
});

// Get the packages via name and version(optional)
router.post('/package/byRegEx', authMiddleware, permMiddleware, async (req: Request, res: Response) => {
  // TODO: Implement the logic to fetch the packages by regular expression from the database
  // console.log('in router POST /packages/byRegEx'); //delete me
  if (!req.middleware.permissions.searchPerm && !req.middleware.permissions.adminPerm) {
    res.status(403).send('Unauthorized - missing permissions');
    return;
  }
  return await searchByRegEx(req, res);
});

// Reset the registry to a system default state
router.delete('/reset', (req: Request, res: Response) => {
  // TODO: Implement the logic to reset the database
});

// Reture the package schema of a package(download)
router.get('/package/:id', authMiddleware, permMiddleware, async (req: Request, res: Response) => {
  // console.log('in router GET /package/:id'); //delete me
  if (!req.middleware.permissions.downloadPerm && !req.middleware.permissions.adminPerm) {
    res.status(403).send('Unauthorized - missing permissions');
    return;
  }
  return await downloadPackage(req, res);
});

// Update the content of the package with this ID
router.post('/package/:id', authMiddleware, permMiddleware, async (req: Request, res: Response) => {
  console.log('in router POST /package/:id'); //delete me
  if (!req.middleware.permissions.downloadPerm && !req.middleware.permissions.adminPerm) {
    res.status(403).send('Unauthorized - missing permissions');
    return;
  }
  return await updatePackage(req, res);
});

// Upload or ingest a new package
router.post('/package', authMiddleware, permMiddleware, async (req: Request, res: Response) => {
  if (!req.middleware.permissions.uploadPerm && !req.middleware.permissions.adminPerm) {
    res.status(403).send('Unauthorized - missing permissions');
    return;
  }
  return await uploadPackage(req, res);
});

// Get ratings of a package
router.get('/package/:id/rate', authMiddleware, permMiddleware, async (req: Request, res: Response) => {
  console.log('in router GET /package/:id'); //delete me
  if (!req.middleware.permissions.downloadPerm && !req.middleware.permissions.adminPerm) {
    res.status(403).send('Unauthorized - missing permissions');
    return;
  }
  return await ratePackage(req, res);
});

// Get the cost of a package
router.post('/package/:id/cost', authMiddleware, permMiddleware, async (req: Request, res: Response) => {
  const id = req.params.id;
  // TODO: Implement the logic to calculate the cost of the package by id
});

router.put('/authenticate', async (req: Request, res: Response) => {
  console.log("hi");
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

router.get('/track', (req: Request, res: Response) => {
  // TODO: Implement the logic to return the track
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

router.get

export default router;