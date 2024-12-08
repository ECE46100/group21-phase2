import { Router, Response } from 'express';
import { Request } from 'express-serve-static-core';

import authenticate from './controllers/authenticate';
import searchPackages from './controllers/searchPackages';
import searchByRegEx from './controllers/searchByRegEx';
import uploadPackage from './controllers/uploadPackage';
import updatePackage from './controllers/updatePackage';
import ratePackage from './controllers/ratePackage';
import downloadPackage from './controllers/downloadPackage';
import createUser from './controllers/createUser';
import createUserGroup from './controllers/createUserGroup';
import deleteUser from './controllers/deleteUser';
import getHistory from './controllers/getHistory';
import reset from './controllers/reset';

import { authMiddleware, permMiddleware } from './middleware/auth_middleware';
import UserService from './services/userService';

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
  if (!req.middleware.permissions.downloadPerm) {
    res.status(401).send('Unauthorized - missing permissions');
    return;
  }
  return await downloadPackage(req, res);
});

router.post('/package/:id', authMiddleware, permMiddleware, async (req: Request, res: Response) => {
  if (!req.middleware.permissions.uploadPerm) {
    res.status(403).send('Unauthorized - missing permissions');
    return;
  }
  return await updatePackage(req, res);
});


router.post('/package', authMiddleware, permMiddleware, async (req: Request, res: Response) => {
  if (!req.middleware.permissions.uploadPerm) {
    res.status(401).send('Unauthorized - missing permissions');
    return;
  }
  return await uploadPackage(req, res);
});


router.get('/package/:id/rate', authMiddleware, permMiddleware, async (req: Request, res: Response) => {
  if (!req.middleware.permissions.searchPerm && !req.middleware.permissions.adminPerm) {
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
  if (!req.middleware.permissions.searchPerm) {
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

router.post('/createUserGroup', authMiddleware, permMiddleware, async (req: Request, res: Response) => {
  if (!req.middleware.permissions.adminPerm) {
    res.status(403).send('Only admins can create user group.');
    return;
  }
  return await createUserGroup(req, res);
});

router.post('/createUser', authMiddleware, permMiddleware, async (req: Request, res: Response) => {
  if (!req.middleware.permissions.adminPerm) {
    res.status(403).send('Only admins can create new user.');
    return;
  }
  return await createUser(req, res);
});

router.delete('/deleteUser', async (req: Request, res: Response) => {
  return await deleteUser(req, res);
});

router.get('/allUserGroups', authMiddleware, permMiddleware, async (req: Request, res: Response) => {
  console.log('in get all user groups');
  if (!req.middleware.permissions.adminPerm) {
    res.status(403).send('Only admins can create new user.');
    return;
  }
  try {
    const userGroups = await UserService.getAllGroups();
    res.status(200).json(userGroups);
  } catch (error) {
    console.error('Error fetching all user groups:', error);
    res.status(500).send('Failed to fetch user groups.');
  }
  return;
});

// Gets upload history of a package (not a version)
// param is name of the package
router.get('/uploadHistory/:name', authMiddleware, permMiddleware, async (req: Request, res: Response) => {
  if (!req.middleware.permissions.adminPerm) {
    res.status(403).send('Only admins can check upload history.');
    return;
  }
  return await getHistory(req, res, 'UPLOAD');
});

router.get('/downloadHistory/:name', authMiddleware, permMiddleware, async (req: Request, res: Response) => {
  if (!req.middleware.permissions.adminPerm) {
    res.status(403).send('Only admins can check download history.');
    return;
  }
  return await getHistory(req, res, 'DOWNLOAD');
});


// Gets the group of upload user
router.get('/user/group', authMiddleware, permMiddleware, async (req: Request, res: Response): Promise<void> => {
  // Fetch the username from middleware (set during authentication)
  const username = req.middleware.username;
  if (!username) {
    res.status(401).send('Unauthorized: Username is missing.');
  }
  // Fetch the user group using UserService
  const userGroup = await UserService.getUserGroup(username);
  // Return the user group as JSON
  res.status(200).json({ groupName: userGroup });
});

export default router;